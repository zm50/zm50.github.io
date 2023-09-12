# GO语言篇之反射

@[toc]

## 前言
Go语言可以在运行期间查看自身结构，在运行时动态地获取结构体的信息，如字段类型，字段数量，方法列表等，动态调用方法

## 获取变量类型
```go
var num int
reflect.TypeOf(num)
```

## 获取变量值
```go
var s = "hello reflect"
reflect.ValueOf(s)
```

## 获取结构体的字段，方法，动态地修改，调用结构体的字段和方法
```go
type Cat struct {
    Name string
    Age int
}

func (c Cat) Hi(name string) string {
    return "你好" + name
}

cat := Cat{Name: "汤姆", Age: 10}
val := reflect.ValueOf(&cat).Elem()
val.FieldByName("Name").SetString("小猫咪")
val.FieldByName("Age").SetInt(12)
args := []reflect.Value{reflect.ValueOf("大黄")}
result := val.MethodByName("Hi").Call(args)
fmt.Println(result[0].String())
```

## 创建变量
```go
reflect.MakeSlice(reflect.TypeOf([]string(nil)), 0, 3)

reflect.MakeChan(reflect.TypeOf((chan int)(nil)), 3)

reflect.MakeMap(reflect.TypeOf(map[string]int(nil)))

reflect.MakeMapWithSize(reflect.TypeOf(map[string]int(nil)), 3)

reflect.MakeFunc(reflect.TypeOf(func(a, b int) int {
    return a + b
}), func(args []reflect.Value) (results []reflect.Value) {
    return []reflect.Value{reflect.ValueOf(args[0].Int() * args[1].Int())}
})
```

## 缺点
>反射可能会降低性能，因为反射需要运行时动态地获取类型信息，因此需要在使用的过程中权衡利弊