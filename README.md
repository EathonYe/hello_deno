# hello_deno

一个简单的rust库，提供了hello方法，能够被deno调用。主要是研究deno如何调用一个rust插件，参考了[webview_deno](https://github.com/webview/webview_deno)。

## Example

```typescript
import { hello } from '../mod.ts'

hello('world')
// => hello, world.
```

## Steps
* 创建一个rust库：`cargo new --lib <name>`。
* 引入一些依赖，必须的是`deno_core`。
* 提供`deno_plugin_init`方法以被调用，并在其中注册可被调用的方法：
```rust
#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
  interface.register_op("hello_say", op_hello_say);
}
```
* 在`op_hello_say`中处理了和`deno`通信过程中的消息的序列化和反序列化。
* 在`Cargo.toml`中声明该库的类型，否则默认是`.rlib`：
```toml
[lib]
crate-type = ["cdylib"]
```
* 创建一个`.ts`文件用来调用该插件并暴露方法，一般将其命名为`mod.ts`。
* 在`mod.ts`中通过[Plug](https://x.nest.land/plug@0.0.4/mod.ts)来调用插件，并暴露能够被普通的`.ts`文件调用的方法，相当于插件在deno层的对外接口。
* 创建一个测试文件，调用`mod.ts`中暴露的方法查看结果。

## Building
```bash
$ cargo clean && cargo build --release
```
在国内下载会很慢，可以修改`cargo`的镜像源；由于`deno_core`依赖了`rusty_v8`，而`rusty_v8`编译很慢，具体可以参考[rusty_v8](https://github.com/denoland/rusty_v8)。