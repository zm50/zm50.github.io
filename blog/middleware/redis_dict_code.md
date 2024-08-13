
@[toc]

# 前言

哈希表是Redis中非常重要的数据结构，这篇博客我们就一起来探索一下Redis中哈希表的奥秘😁

# 代码位置

src/dict.h
src/dict.c

# 哈希表

- 原理

哈希表用于键值对的存储和查找，通过哈希函数将键映射到一个的索引上，来保存相应的值

- 优势

哈希表的优势是增删改查的时间复杂度都是O(1)，哈希表在大量的数据中也能保持良好的性能，因为哈希函数会将键均匀地分散在整个数组中

- 问题

多个键通过哈希函数映射到同一个索引时，就会产生哈希冲突

- 解决问题

常见的解决哈希冲突的方法有链式哈希法或开放寻址法

在链式哈希法中，每个索引位置上都存储一个桶，每个桶是个链表，用来链接冲突的键值对

在开放寻址法中，当发生冲突时，会继续向后探测数组，直到找到一个空闲的位置来存储冲突的键值对

- redis选型

redis使用了链式哈希法来实现hash表，使用渐进式 rehash 方法来减少哈希冲突
- rehash

就是创建一个更大的hash表，然后将原本的hash表迁移过去，因为新hash表更大，造成哈希冲突的几率也就更小

- 渐进式rehash

因为rehash操作需要迁移整个hash表，代价很大，我们可以在不影响redis对外正常服务的情况下逐步的进行迁移
在迁移过程中新的数据写入只会发生在新哈希表中，旧哈希表仅用于读取操作。这样可以避免写入操作复杂度的增加
当所有数据都完成迁移后，Redis会将新哈希表替换旧哈希表，完成rehash过程
# 核心代码

```c
// 哈希表的行为
typedef struct dictType {
    // 计算哈希值的函数
    uint64_t (*hashFunction)(const void *key);
	// 复制键的函数
    void *(*keyDup)(dict *d, const void *key);
    // 复制值的函数
    void *(*valDup)(dict *d, const void *obj);
    // 比较键的函数
    int (*keyCompare)(dict *d, const void *key1, const void *key2);
	// 销毁键的函数
    void (*keyDestructor)(dict *d, void *key);
    // 销毁值的函数
    void (*valDestructor)(dict *d, void *obj);
    // hash表扩展
    int (*expandAllowed)(size_t moreMem, double usedRatio);
    // 开启rehash，此时新旧hash表已经创建过了
    void (*rehashingStarted)(dict *d);
	// rehash完成后的钩子函数，通常是一些清理工作，比如释放临时分配的内存或者更新哈希表的状态信息
    void (*rehashingCompleted)(dict *d);
	// 获取hash表中元数据所占用的字节数
    size_t (*dictMetadataBytes)(dict *d);
    // 标识是否使用值
    unsigned int no_value:1;
    /* If no_value = 1 and all keys are odd (LSB=1), setting keys_are_odd = 1
     * enables one more optimization: to store a key without an allocated
     * dictEntry. */
    // 如果 no_value = 1，且所有键都是奇数，则设置keys_are_odd = 1可以启用优化：存储未分配dictEntry的键
    unsigned int keys_are_odd:1;
    /* TODO: Add a 'keys_are_even' flag and use a similar optimization if that
     * flag is set. */
} dictType;
```

```c
// 哈希表中的元素
struct dictEntry {
    // 键
    void *key;
    // 值，小技巧：如果值是uint64_t、int64_t、double中的，就直接存储对应内容，无需使用指针，减少内存开销
    union {
        void *val;
        uint64_t u64;
        int64_t s64;
        double d;
    } v;
    // 下一个元素
    struct dictEntry *next;
};
```

```c
// 哈希表
struct dict {
    // 指定hash表的行为
    dictType *type;

    // 两张hash表，在rehash时交替使用，每张hash表里面是二维的dictEntry
    dictEntry **ht_table[2];

    // 两张哈希表中键值对的使用数量
    unsigned long ht_used[2];

    // 标识是否正在进行rehash, -1表示没有进行rehash
    long rehashidx;

    // 标识是否暂停rehash，>0表示暂停rehash，<0表示编码错误
    int16_t pauserehash;
    
    // 大小的指数，size = 1 << exp
    signed char ht_size_exp[2];

    // 元数据
    void *metadata[];
};
```

以上实现我们不难看出，如果哈希冲突过多会使dictEntry链表变长，导致操作该位置的hash表在性能上减弱



# rehash

rehash是扩充hash表的一个操作，它可以减少哈希冲突的概率，Redis中rehash操作是渐进式的，当触发rehash操作时，逐渐地将旧hash表的数据放入新hash表中，最终当数据转移完成之后旧hash表的空间会被释放

```c
// 如果需要进行扩容
static int _dictExpandIfNeeded(dict *d)
{
    // 如果已经在进行rehash操作就直接退出
    if (dictIsRehashing(d)) return DICT_OK;

    // 若hash表为空，就扩容成初始大小
    if (DICTHT_SIZE(d->ht_size_exp[0]) == 0) return dictExpand(d, DICT_HT_INITIAL_SIZE);

    // 启用了rehash且哈希表的大小达到或超过当前容量 或者 未禁止rehash且当前hash表的使用率大于比率阈值
    if ((dict_can_resize == DICT_RESIZE_ENABLE &&
         d->ht_used[0] >= DICTHT_SIZE(d->ht_size_exp[0])) ||
        (dict_can_resize != DICT_RESIZE_FORBID &&
         d->ht_used[0] / DICTHT_SIZE(d->ht_size_exp[0]) > dict_force_resize_ratio))
    {
		/// 如果hash表中表示已经扩容过，就退出
        if (!dictTypeExpandAllowed(d))
            return DICT_OK;

        // 触发扩容
        return dictExpand(d, d->ht_used[0] + 1);
    }
    return DICT_OK;
}
```
```c
// 扩容
int _dictExpand(dict *d, unsigned long size, int* malloc_failed)
{
    if (malloc_failed) *malloc_failed = 0;

    // 如果正在进行rehash 或者 当前使用的hash表的大小大于将要分配的容量，直接退出
    if (dictIsRehashing(d) || d->ht_used[0] > size)
        return DICT_ERR;

	// 新hash表
    dictEntry **new_ht_table;
	// 新hash表中元素的使用数量
    unsigned long new_ht_used;
	// 新hash表的大小指数
    signed char new_ht_size_exp = _dictNextExp(size);

    // 计算新hash表的大小
    size_t newsize = DICTHT_SIZE(new_ht_size_exp);
    // 如果新大小不够，则直接返回
    if (newsize < size || newsize * sizeof(dictEntry*) < newsize)
        return DICT_ERR;

    // 若大小指数未变化，则返回
    if (new_ht_size_exp == d->ht_size_exp[0]) return DICT_ERR;

    if (malloc_failed) {
        // 检查分配是否会失败
        // 尝试进行分配新的hash表
        new_ht_table = ztrycalloc(newsize*sizeof(dictEntry*));
        // 标识分配是否失败
        *malloc_failed = new_ht_table == NULL;
        if (*malloc_failed)
            // 分配失败，直接返回
            return DICT_ERR;
    } else
        // 分配新的hash表
        new_ht_table = zcalloc(newsize*sizeof(dictEntry*));

    // 新的hash表使用量为0
    new_ht_used = 0;

    // 新hash表初始化
    d->ht_size_exp[1] = new_ht_size_exp;
    d->ht_used[1] = new_ht_used;
    d->ht_table[1] = new_ht_table;
    d->rehashidx = 0;
    // 执行rehash启动的钩子函数
    if (d->type->rehashingStarted) d->type->rehashingStarted(d);

	// 如果hash表为空
    if (d->ht_table[0] == NULL || d->ht_used[0] == 0) {
        // 执行rehash结束后的钩子函数
        if (d->type->rehashingCompleted) d->type->rehashingCompleted(d);
        // 如果旧hash表未释放，则释放掉
        if (d->ht_table[0]) zfree(d->ht_table[0]);
        // 旧hash表重新指向分配并迁移完成的新hash表
        d->ht_size_exp[0] = new_ht_size_exp;
        d->ht_used[0] = new_ht_used;
        d->ht_table[0] = new_ht_table;
        // 重置hash表，将旧表中的所有元素都会被释放，确保新的哈希表不会包含旧的元素，保证哈希表的效率和一致性
        _dictReset(d, 1);
        // 标志rehash结束
        d->rehashidx = -1;
        return DICT_OK;
    }

    return DICT_OK;
}

// rehash，不考虑内存分配是否成功
int dictExpand(dict *d, unsigned long size) {
    return _dictExpand(d, size, NULL);
}

// rehash，考虑内存分配是否成功
int dictTryExpand(dict *d, unsigned long size) {
    int malloc_failed;
    _dictExpand(d, size, &malloc_failed);
    return malloc_failed? DICT_ERR : DICT_OK;
}
```
```c
int dictRehash(dict *d, int n) {
	// 最多访问n*10个空桶
    int empty_visits = n*10;
	// hash表0的大小
    unsigned long s0 = DICTHT_SIZE(d->ht_size_exp[0]);
    // hash表1的大小
    unsigned long s1 = DICTHT_SIZE(d->ht_size_exp[1]);
    // 若禁止resize或者未进行rehash，则返回
    if (dict_can_resize == DICT_RESIZE_FORBID || !dictIsRehashing(d)) return 0;
    // 如果避免resize，且s1大于s0且s1 / s0的比率小于resize的阈值 或者 s1小于s0且s0 / s1的比率小于resize的阈值，则返回
    if (dict_can_resize == DICT_RESIZE_AVOID && 
        ((s1 > s0 && s1 / s0 < dict_force_resize_ratio) ||
         (s1 < s0 && s0 / s1 < dict_force_resize_ratio)))
    {
        return 0;
    }

    // 主循环，根据要拷贝的bucket数量n，循环n次后停止或ht[0]中的数据迁移完停止
    while(n-- && d->ht_used[0] != 0) {
        dictEntry *de, *nextde;

        /* Note that rehashidx can't overflow as we are sure there are more
         * elements because ht[0].used != 0 */
        assert(DICTHT_SIZE(d->ht_size_exp[0]) > (unsigned long)d->rehashidx);
        // 遍历旧hash表，找到第一个不为空的桶
        while(d->ht_table[0][d->rehashidx] == NULL) {
            d->rehashidx++;
            // 如果访问空桶数量达到阈值，则返回
            if (--empty_visits == 0) return 1;
        }
        // 当前不为空的桶
        de = d->ht_table[0][d->rehashidx];
        /* Move all the keys in this bucket from the old to the new hash HT */
		// 遍历该桶
        while(de) {
            // 新节点在新hash表中的索引位置
            uint64_t h;

			// 保存下一个哈希节点的指针，因为重新散列过程中当前哈希节点可能会被释放或者重新分配位置
            nextde = dictGetNext(de);
            
            // 获取该节点的key
            void *key = dictGetKey(de);
            
            // 计算新哈希节点在新哈希表中的索引位置
            if (d->ht_size_exp[1] > d->ht_size_exp[0]) {
                h = dictHashKey(d, key) & DICTHT_SIZE_MASK(d->ht_size_exp[1]);
            } else {
                h = d->rehashidx & DICTHT_SIZE_MASK(d->ht_size_exp[1]);
            }
			
			// 判断当前节点是否存有value
            if (d->type->no_value) {
				// 若所有键都是奇数且新hash表在h位置的桶不存在，则存储未分配dictEntry的键
                if (d->type->keys_are_odd && !d->ht_table[1][h]) {
                    assert(entryIsKey(key));
                    // 若当前节点是dictEntry，则进行优化，只存储未分配dictEntry的键
                    if (!entryIsKey(de)) zfree(decodeMaskedPtr(de));
                    de = key;
                } else if (entryIsKey(de)) { // 判断当前节点是否只存在键
                    /* We don't have an allocated entry but we need one. */
                    // 只存储未分配dictEntry的键
                    de = createEntryNoValue(key, d->ht_table[1][h]);
                } else {
                    /* Just move the existing entry to the destination table and
                     * update the 'next' field. */
                    assert(entryIsNoValue(de));
                	// 将当前节点的下一个指针指向新hash表中h槽位的头指针
                    dictSetNext(de, d->ht_table[1][h]);
                }
            } else {
               	// 将当前节点的下一个指针指向新hash表中h槽位的头指针
                dictSetNext(de, d->ht_table[1][h]);
            }
            // 设置新hash表中h槽位的元素为当前的桶
            d->ht_table[1][h] = de;
            // 更新两个哈希表的节点数量
            d->ht_used[0]--;
            d->ht_used[1]++;
            // de指向下一个节点，用于下次循环
            de = nextde;
        }
        // 从旧hash表中移除当前元素
        d->ht_table[0][d->rehashidx] = NULL;
		
		// 遍历下一个元素
        d->rehashidx++;
    }

	// 检查是否已经完成整个hash表的rehash了
    if (d->ht_used[0] == 0) {
        if (d->type->rehashingCompleted) d->type->rehashingCompleted(d);
        // 释放旧hash表
        zfree(d->ht_table[0]);
        // 让旧hash表指向新hash表
        d->ht_table[0] = d->ht_table[1];
        d->ht_used[0] = d->ht_used[1];
        d->ht_size_exp[0] = d->ht_size_exp[1];
        // 重置新哈希表的状态
        _dictReset(d, 1);
		// 关闭hash表的渐进式 rehash 标志
        d->rehashidx = -1;
        // 返回0，表示rehash完成
        return 0;
    }

	// 返回1，表示rehash未完成
    return 1;
}
```

# 最后
恭喜我们一起看完了redis中哈希表的核心源码，渐进式rehash的源码，希望你能有所收获😉