#ifndef BUILDING_NODE_EXTENSION
#define BUILDING_NODE_EXTENSION
#endif

#include <node.h>
#include <v8.h>

#include <iomanip>
#include <limits>
#include <sstream>

#include "Int64.h"

using namespace node;
using namespace std;
using namespace v8;

Persistent<Function> Int64::constructor;

void Int64::Init(Handle<Object> exports) {
  Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
  tpl->SetClassName(String::NewSymbol("Int64"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("toNumber"),
    FunctionTemplate::New(ToNumber)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("valueOf"),
    FunctionTemplate::New(ValueOf)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("toString"),
    FunctionTemplate::New(ToString)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("toUnsignedDecimalString"),
    FunctionTemplate::New(ToUnsignedDecimalString)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("toSignedDecimalString"),
    FunctionTemplate::New(ToSignedDecimalString)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("equals"),
    FunctionTemplate::New(Equals)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("compare"),
    FunctionTemplate::New(Compare)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("high32"),
    FunctionTemplate::New(High32)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("low32"),
    FunctionTemplate::New(Low32)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("shiftLeft"),
    FunctionTemplate::New(ShiftLeft)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("shiftRight"),
    FunctionTemplate::New(ShiftRight)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("and"),
    FunctionTemplate::New(And)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("or"),
    FunctionTemplate::New(Or)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("xor"),
    FunctionTemplate::New(Xor)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("add"),
    FunctionTemplate::New(Add)->GetFunction()
  );
  tpl->PrototypeTemplate()->Set(
    String::NewSymbol("sub"),
    FunctionTemplate::New(Sub)->GetFunction()
  );
  constructor = Persistent<Function>::New(tpl->GetFunction());
  exports->Set(String::NewSymbol("Int64"), constructor);
}

Int64::Int64() {
  mValue = 0;
}

Int64::Int64(const Local<Number>& n) {
  mValue = static_cast<uint64_t>(n->NumberValue());
}

Int64::Int64(const Local<Number>& hi, const Local<Number>& lo) {
  uint32_t highBits = static_cast<uint32_t>(hi->NumberValue());
  uint32_t lowBits = static_cast<uint32_t>(lo->NumberValue());
  mValue =
    (static_cast<uint64_t>(highBits) << 32) |
    (static_cast<uint64_t>(lowBits));
}

Int64::Int64(const Local<String>& s) {
  String::Utf8Value utf8(s);
  stringstream ss;
  char* ps = *utf8;
  if (utf8.length() > 2 && ps[0] == '0' && ps[1] == 'x') {
    ss << hex << (ps + 2);
  } else {
    ss << ps;
  }
  ss >> mValue;
}

Int64::~Int64() {}

Handle<Value> Int64::New(const Arguments& args) {
  HandleScope scope;
  Int64* obj = NULL;
  if (args.Length() == 0) {
    obj = new Int64();
  } else if (args.Length() == 1) {
    if (args[0]->IsNumber()) {
      obj = new Int64(args[0]->ToNumber());
    } else if (args[0]->IsString()) {
      obj = new Int64(args[0]->ToString());
    }
  } else if (args.Length() == 2) {
    if (args[0]->IsNumber() && args[1]->IsNumber()) {
      obj = new Int64(args[0]->ToNumber(), args[1]->ToNumber());
    }
  }
  if (obj == NULL) {
    ThrowException(Exception::TypeError(String::New("Wrong arguments")));
    return scope.Close(Undefined());
  }
  obj->Wrap(args.This());
  return args.This();
}

Handle<Value> Int64::ToNumber(const Arguments& args) {
  HandleScope scope;
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  if (obj->mValue >= 1ull << 53) {
    return scope.Close(Number::New(numeric_limits<double>::infinity()));
  }
  double value = static_cast<double>(obj->mValue);
  return scope.Close(Number::New(value));
}

Handle<Value> Int64::ValueOf(const Arguments& args) {
  return ToNumber(args);
}

Handle<Value> Int64::ToString(const Arguments& args) {
  HandleScope scope;
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  
  std::ostringstream o;
  o << "0x" << hex << setfill('0') << setw(16) << obj->mValue;
  return scope.Close(String::New(o.str().c_str()));
}

Handle<Value> Int64::ToUnsignedDecimalString(const Arguments& args) {
  HandleScope scope;
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());

  std::ostringstream o;
  o << obj->mValue;
  return scope.Close(String::New(o.str().c_str()));
}

Handle<Value> Int64::ToSignedDecimalString(const Arguments& args) {
  HandleScope scope;
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());

  std::ostringstream o;
  o << (static_cast<int64_t>(obj->mValue));
  return scope.Close(String::New(o.str().c_str()));
}

Handle<Value> Int64::Equals(const Arguments& args) {
  HandleScope scope;
  if (args.Length() < 1) {
    ThrowException(Exception::TypeError(String::New("Argument required")));
    return scope.Close(Undefined());
  }
  if (!args[0]->IsObject()) {
    ThrowException(Exception::TypeError(String::New("Object expected")));
    return scope.Close(Undefined());
  }
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  Int64* otherObj = ObjectWrap::Unwrap<Int64>(args[0]->ToObject());
  bool isEqual = obj->mValue == otherObj->mValue;
  return scope.Close(Boolean::New(isEqual));
}

Handle<Value> Int64::Compare(const Arguments& args) {
  HandleScope scope;
  if (args.Length() < 1) {
    ThrowException(Exception::TypeError(String::New("Argument required")));
    return scope.Close(Undefined());
  }
  if (!args[0]->IsObject()) {
    ThrowException(Exception::TypeError(String::New("Object expected")));
    return scope.Close(Undefined());
  }
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  Int64* otherObj = ObjectWrap::Unwrap<Int64>(args[0]->ToObject());
  int32_t cmp = 0;
  if (obj->mValue < otherObj->mValue) {
    cmp = -1;
  } else if (obj->mValue > otherObj->mValue) {
    cmp = 1;
  }
  return scope.Close(Int32::New(cmp));
}

Handle<Value> Int64::High32(const Arguments& args) {
  HandleScope scope;
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint32_t highBits = static_cast<uint32_t>(obj->mValue >> 32);
  return scope.Close(Int32::NewFromUnsigned(highBits));
}

Handle<Value> Int64::Low32(const Arguments& args) {
  HandleScope scope;
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint32_t lowBits = static_cast<uint32_t>(obj->mValue & 0xffffffffull);
  return scope.Close(Int32::NewFromUnsigned(lowBits));
}

Handle<Value> Int64::ShiftLeft(const Arguments& args) {
  HandleScope scope;
  if (args.Length() < 1) {
    ThrowException(Exception::TypeError(String::New("Argument required")));
    return scope.Close(Undefined());
  }
  if (!args[0]->IsNumber()) {
    ThrowException(Exception::TypeError(String::New("Integer expected")));
    return scope.Close(Undefined());
  }
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint64_t shiftBy = static_cast<uint64_t>(args[0]->ToNumber()->NumberValue());
  uint64_t value = obj->mValue << shiftBy;
  Local<Value> argv[2] = {
    Int32::NewFromUnsigned(static_cast<uint32_t>(value >> 32)),
    Int32::NewFromUnsigned(static_cast<uint32_t>(value & 0xffffffffull))
  };
  Local<Object> instance = constructor->NewInstance(2, argv);
  return scope.Close(instance);
}

Handle<Value> Int64::ShiftRight(const Arguments& args) {
  HandleScope scope;
  if (args.Length() < 1) {
    ThrowException(Exception::TypeError(String::New("Argument required")));
    return scope.Close(Undefined());
  }
  if (!args[0]->IsNumber()) {
    ThrowException(Exception::TypeError(String::New("Integer expected")));
    return scope.Close(Undefined());
  }
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint64_t shiftBy = static_cast<uint64_t>(args[0]->ToNumber()->NumberValue());
  uint64_t value = obj->mValue >> shiftBy;
  Local<Value> argv[2] = {
    Int32::NewFromUnsigned(static_cast<uint32_t>(value >> 32)),
    Int32::NewFromUnsigned(static_cast<uint32_t>(value & 0xffffffffull))
  };
  Local<Object> instance = constructor->NewInstance(2, argv);
  return scope.Close(instance);
}

Handle<Value> Int64::And(const Arguments& args) {
  HandleScope scope;
  if (args.Length() < 1) {
    ThrowException(Exception::TypeError(String::New("Argument required")));
    return scope.Close(Undefined());
  }
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint64_t value;
  if (args[0]->IsNumber()) {
    value = obj->mValue & args[0]->IntegerValue();
  } else if (args[0]->IsObject()) {
    Int64* otherObj = ObjectWrap::Unwrap<Int64>(args[0]->ToObject());
    value = obj->mValue & otherObj->mValue;
  } else {
    ThrowException(Exception::TypeError(String::New("Object or number expected")));
    return scope.Close(Undefined());
  }
  Local<Value> argv[2] = {
    Int32::NewFromUnsigned(static_cast<uint32_t>(value >> 32)),
    Int32::NewFromUnsigned(static_cast<uint32_t>(value & 0xffffffffull))
  };
  Local<Object> instance = constructor->NewInstance(2, argv);
  return scope.Close(instance);
}

Handle<Value> Int64::Or(const Arguments& args) {
  HandleScope scope;
  if (args.Length() < 1) {
    ThrowException(Exception::TypeError(String::New("Argument required")));
    return scope.Close(Undefined());
  }
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint64_t value;
  if (args[0]->IsNumber()) {
    value = obj->mValue | args[0]->IntegerValue();
  } else if (args[0]->IsObject()) {
    Int64* otherObj = ObjectWrap::Unwrap<Int64>(args[0]->ToObject());
    value = obj->mValue | otherObj->mValue;
  } else {
    ThrowException(Exception::TypeError(String::New("Object or number expected")));
    return scope.Close(Undefined());
  }
  Local<Value> argv[2] = {
    Int32::NewFromUnsigned(static_cast<uint32_t>(value >> 32)),
    Int32::NewFromUnsigned(static_cast<uint32_t>(value & 0xffffffffull))
  };
  Local<Object> instance = constructor->NewInstance(2, argv);
  return scope.Close(instance);
}

Handle<Value> Int64::Xor(const Arguments& args) {
  HandleScope scope;
  if (args.Length() < 1) {
    ThrowException(Exception::TypeError(String::New("Argument required")));
    return scope.Close(Undefined());
  }
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint64_t value;
  if (args[0]->IsNumber()) {
    value = obj->mValue ^ args[0]->IntegerValue();
  } else if (args[0]->IsObject()) {
    Int64* otherObj = ObjectWrap::Unwrap<Int64>(args[0]->ToObject());
    value = obj->mValue ^ otherObj->mValue;
  } else {
    ThrowException(Exception::TypeError(String::New("Object or number expected")));
    return scope.Close(Undefined());
  }
  Local<Value> argv[2] = {
    Int32::NewFromUnsigned(static_cast<uint32_t>(value >> 32)),
    Int32::NewFromUnsigned(static_cast<uint32_t>(value & 0xffffffffull))
  };
  Local<Object> instance = constructor->NewInstance(2, argv);
  return scope.Close(instance);
}

Handle<Value> Int64::Add(const Arguments& args) {
  HandleScope scope;
  if (args.Length() < 1) {
    ThrowException(Exception::TypeError(String::New("Argument required")));
    return scope.Close(Undefined());
  }
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint64_t value;
  if (args[0]->IsNumber()) {
    value = obj->mValue + args[0]->IntegerValue();
  } else if (args[0]->IsObject()) {
    Int64* otherObj = ObjectWrap::Unwrap<Int64>(args[0]->ToObject());
    value = obj->mValue + otherObj->mValue;
  } else {
    ThrowException(Exception::TypeError(String::New("Object or number expected")));
    return scope.Close(Undefined());
  }
  Local<Value> argv[2] = {
    Int32::NewFromUnsigned(static_cast<uint32_t>(value >> 32)),
    Int32::NewFromUnsigned(static_cast<uint32_t>(value & 0xffffffffull))
  };
  Local<Object> instance = constructor->NewInstance(2, argv);
  return scope.Close(instance);
}

Handle<Value> Int64::Sub(const Arguments& args) {
  HandleScope scope;
  if (args.Length() < 1) {
    ThrowException(Exception::TypeError(String::New("Argument required")));
    return scope.Close(Undefined());
  }
  Int64* obj = ObjectWrap::Unwrap<Int64>(args.This());
  uint64_t value;
  if (args[0]->IsNumber()) {
    value = obj->mValue - args[0]->IntegerValue();
  } else if (args[0]->IsObject()) {
    Int64* otherObj = ObjectWrap::Unwrap<Int64>(args[0]->ToObject());
    value = obj->mValue - otherObj->mValue;
  } else {
    ThrowException(Exception::TypeError(String::New("Object or number expected")));
    return scope.Close(Undefined());
  }
  Local<Value> argv[2] = {
    Int32::NewFromUnsigned(static_cast<uint32_t>(value >> 32)),
    Int32::NewFromUnsigned(static_cast<uint32_t>(value & 0xffffffffull))
  };
  Local<Object> instance = constructor->NewInstance(2, argv);
  return scope.Close(instance);
}
