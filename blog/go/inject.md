@[toc]

# 前言
你好，我是醉墨居士，欢迎来到我的博客，今天带领大伙使用Go语言实现依赖自动注入，我们不会使用其它的第三方库，项目核心代码不到100行，是Go语言初学者难得的精简项目

# 依赖注入是什么

依赖注入（Dependency Injection，简称DI）是一种设计模式，用于实现控制反转（Inversion of Control，简称IoC）原则。它的核心思想是将对象的依赖关系从内部管理转移到外部管理，从而降低对象之间的耦合度，提高代码的灵活性和可测试性

# 依赖注入的好处是什么
降低耦合度：通过将依赖关系从对象内部转移到外部，可以降低对象之间的耦合度。这样，对象只需要知道它需要什么，而不需要知道如何获取这些依赖

提高可测试性：依赖注入使得单元测试变得更加容易。在测试时，可以轻松地替换掉真实的依赖对象，使用模拟对象（Mock Object）或存根（Stub）来进行测试，从而隔离被测试代码

增强可维护性：由于依赖关系被明确地定义和管理，代码的可读性和可维护性得到了提高。当需要修改依赖关系时，只需要在配置或注入点进行修改，而不需要修改对象内部的代码

促进代码重用：依赖注入使得组件可以更容易地在不同的上下文中重用。因为组件不直接创建和管理自己的依赖，所以它们可以在不同的环境中被配置和使用

支持面向接口编程：依赖注入鼓励使用接口来定义依赖关系，而不是具体的实现类。这使得代码更加灵活，因为可以在运行时替换不同的实现，而不需要修改调用代码

简化对象创建：依赖注入容器（如Spring的ApplicationContext）可以自动管理对象的创建和生命周期，开发者不需要手动创建和管理这些对象，从而简化了代码

# 结构图
现在介绍一下我们依赖注入这个小项目的结构图
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/863dc6e3a5b84a1989b50264d3d2bd0e.png)

# 应用程序上下文接口
```go
type BeanProvider func() reflect.Value

type ApplicationContext interface {
	Inject(provider BeanProvider, name string) error
	Autowise(obj any, name string) error
}
```

# 上下文管理器
```go
type context struct {
	namedConatiner map[string]BeanProvider
	typedContainer map[reflect.Type]BeanProvider
}

// 实现依赖注入
func (c *context) Inject(provider BeanProvider, name string) error {
	if provider == nil {
		return fmt.Errorf("inject: provider can not be nil")
	}

	if name == "" {
		// type inject
		ty := provider().Type()

		if _, ok := c.typedContainer[ty];ok {
			return fmt.Errorf("inject: %v is ambiguous", ty)
		}

		c.typedContainer[ty] = provider
	} else {
		// name inject
		if _, ok := c.namedConatiner[name];ok {
			return fmt.Errorf("inject: %v is ambiguous", name)
		}

		c.namedConatiner[name] = provider
	}

	return nil
}

// 实现自动装配
func (c *context) Autowise(val any, name string) error {
	if val == nil {
		return fmt.Errorf("inject: nil value")
	}
	rv := reflect.ValueOf(val)
	if rv.Kind() != reflect.Ptr {
		return fmt.Errorf("inject: %v is not a pointer", rv)
	}
	ri := reflect.Indirect(rv)
	rt := ri.Type()
	var provider BeanProvider
	if name == "" {
		// type autowise
		provider = c.typedContainer[rt]
	} else {
		// name autowise
		provider = c.namedConatiner[name]
	}

	if provider == nil {
		return fmt.Errorf("inject: %v is not found", name)
	}

	obj := provider()
	if obj.CanConvert(rt) {
		ri.Set(obj.Convert(rt))
		return nil
	}

	return fmt.Errorf("inject: value can not convert to %s", ri.Type())
}
```

# 暴露的功能
```go
func defaultBeanProvider(v any) BeanProvider {
	return func() reflect.Value {
		return reflect.ValueOf(v)
	}
}

// 对外暴露依赖注入的能力，name为空字符串时表示默认使用类型注入
func Inject(obj any, name string) error {
	return instance.Inject(defaultBeanProvider(obj), name)
}

// 对外暴露依赖注入的能力，name为空字符串时表示默认使用类型注入
func DeepInject(provider BeanProvider, name string) error {
	return instance.Inject(provider, name)
}

// 对外暴露自动装配的能力，name为空字符串时表示默认使用类型自动装配
func Autowise[T any](obj *T, name string) error {
	return instance.Autowise(obj, name)
}
```

# 使用示例

示例代码
```go
package main

import (
	"fmt"
	"github.com/zm50/injector"
	"reflect"
)

type TwoString struct {
	s1 *string
	s2 *string
}

func main() {
	// 通过类型注入变量，注入一个string类型的变量
	var injectString string = "醉墨居士"
	err := injector.Inject(injectString, "")
	if err != nil {
		panic(err)
	}
	// 通过类型装配变量，通过string类型自动装配变量
	var autowiseString string
	err = injector.Autowise(&autowiseString, "")
	if err != nil {
		panic(err)
	}

	fmt.Println("类型注入和装配的演示结果")
	fmt.Println("注入的变量：", injectString, "装配的变量：", autowiseString)

	// 通过名称注入变量
	var injectName string = "醉墨"
	var injectString2 string = "居士"
	err = injector.Inject(injectString2, injectName)
	if err != nil {
		panic(err)
	}
	// 通过名称装配变量
	var autowiseString2 string
	err = injector.Autowise(&autowiseString2, "醉墨")
	if err != nil {
		panic(err)
	}

	fmt.Println("名称注入和装配的演示结果")
	fmt.Println("注入的变量：", injectString2, "装配的变量：", autowiseString2)

	// 通过类型注入结构体指针
	injectStruct := &TwoString{}
	injectStruct.s1 = new(string)
	injectStruct.s2 = new(string)
	*injectStruct.s1 = "醉墨"
	*injectStruct.s2 = "居士"
	err = injector.Inject(injectStruct, "")
	if err != nil {
        panic(err)
    }
	// 通过类型装配结构体指针
	autowiseStruct := &TwoString{}
	err = injector.Autowise(&autowiseStruct, "")
	if err != nil {
		panic(err)
	}

	fmt.Println("结构体指针注入和装配的演示结果")
	fmt.Println("注入的变量：", injectStruct, *(injectStruct.s1), *(injectStruct.s2))
	fmt.Println("装配的变量：", autowiseStruct, *(autowiseStruct.s1), *(autowiseStruct.s2))
	fmt.Println("是否相等：", injectStruct == autowiseStruct, injectStruct.s1 == autowiseStruct.s1, injectStruct.s2 == autowiseStruct.s2)

	// 自定义依赖注入和装配的能力，演示自定义依赖注入和装配的能力实现深拷贝，大家可以也根据自己的需求自定义依赖注入和装配的能力
	injectStruct2 := &TwoString{
		s1: new(string), s2: new(string),
	}
	*(injectStruct2.s1) = "醉墨"
	*(injectStruct2.s2) = "居士"
	provider := func() reflect.Value {
		twoString := TwoString{}
		twoString.s1 = new(string)
		twoString.s2 = new(string)
		*twoString.s1 = *injectStruct.s1
		*twoString.s2 = *injectStruct.s2
		return reflect.ValueOf(twoString)
	}
	err = injector.DeepInject(provider, "")
	if err != nil {
		panic(err)
	}
	autowiseStruct2 := &TwoString{}
	err = injector.Autowise(autowiseStruct2, "")
	if err != nil {
		panic(err)
	}

	fmt.Println("自定义规则实现结构体深拷贝注入和装配的演示结果")
	fmt.Println("注入的变量：", injectStruct2, *(injectStruct2.s1), *(injectStruct2.s2))
	fmt.Println("装配的变量：", autowiseStruct2, *(autowiseStruct2.s1), *(autowiseStruct2.s2))
	fmt.Println("是否相等：", injectStruct2 == autowiseStruct2, injectStruct2.s1 == autowiseStruct2.s1, injectStruct2.s2 == autowiseStruct2.s2)
}
```

示例结果
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/ef9df15d4edc4ad5972f834388d98c00.png)

# 最后
至此，各位我们已经一起完成了这个依赖注入的小项目
我是醉墨居士，我们下篇博客见
