#ifndef BUILDING_NODE_EXTENSION
#define BUILDING_NODE_EXTENSION
#endif

#include <node.h>
#include <v8.h>

#include "Int64.h"

using namespace node;
using namespace v8;

void InitAll(Handle<Object> exports) {
  Int64::Init(exports);
}

NODE_MODULE(Int64, InitAll)
