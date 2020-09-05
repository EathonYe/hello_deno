use deno_core::plugin_api::Buf;
use deno_core::plugin_api::Interface;
use deno_core::plugin_api::Op;
use deno_core::plugin_api::ZeroCopyBuf;
use serde::Deserialize;
use serde::Serialize;

#[no_mangle]
pub fn deno_plugin_init(interface: &mut dyn Interface) {
  interface.register_op("hello_say", op_hello_say);
}

#[derive(Serialize)]
struct HelloResponse<T> {
  err: Option<String>,
  ok: Option<T>,
}

#[derive(Deserialize)]
struct HelloParams {
    name: String
}

#[derive(Serialize)]
struct HelloResult {
  say: String,
}

fn op_hello_say(
    _interface: &mut dyn Interface,
    zero_copy: &mut [ZeroCopyBuf],
) -> Op {
    let mut response: HelloResponse<HelloResult> = 
    HelloResponse {
        err: None,
        ok: None
    };
    let buf = &zero_copy[0][..];
    let params: HelloParams = serde_json::from_slice(buf).unwrap();

    let ret = hello_say(&params.name);

    response.ok = Some(HelloResult{ say: ret });
    let result: Buf = serde_json::to_vec(&response).unwrap().
        into_boxed_slice();
    Op::Sync(result)
}

pub fn hello_say(name: &String) -> String {
    String::from("hello, ") + name + "."
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let name = String::from("eathon");
        assert_eq!(hello_say(&name), "hello, eathon.");
    }
}
