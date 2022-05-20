1.variable:
注释
const f = 1.5; // This is line-ending comment. 
const g = 2.5; /* This is a block comment
                that spans lines.
                /* Block comments can nest.
                 */
                But all block comments must terminate.
               */

EXAMPLE: BOOLEAN LITERALS
const a = true;
const b = false;

EXAMPLE: INTEGER LITERALS
const a = 0x123; 
const b = 0X123u;//u 是无符号
const c = 1u;
const d = 123;
const e = 0;
const f = 0i;
const g = 0x3f;

EXAMPLE: FLOATING POINT LITERALS
const a = 0.e+4f;
const b = 01.;
const c = .01;
const d = 12.34;
const f = .0f;
const g = 0h;
const h = 1e-3;
const i = 0xa.fp+2;
const j = 0x1P+4f;
const k = 0X.3;
const l = 0x3p+2h;
const m = 0X1.fp-4;
const n = 0x3.2p+2h;

i	i32
u	u32
f	f32
h   f16//half-float
p   pow?


i32
vec2<i32>
vec3<i32>
vec4<i32>

f32
vec2<f32>
vec3<f32>
vec4<f32>

f16
vec2<f16>
vec3<f16>
vec4<f16>

The scalar types are bool, i32, u32, f32, and f16. 
The numeric scalar types are i32, u32, f32, and f16. 
The integer scalar types are i32 and u32.

let x : vec3<f32> = a + b; // a and b are vec3<f32>
// x[0] = a[0] + b[0]
// x[1] = a[1] + b[1]
// x[2] = a[2] + b[2]

// array<f32,8> and array<i32,8> are different types:
// different element types
var<private> a: array<f32,8>;
var<private> b: array<i32,8>;
var<private> c: array<i32,8u>;  // array<i32,8> and array<i32,8u> are the same type

const width = 8;
const height = 8;

// array<i32,8>, array<i32,8u>, and array<i32,width> are the same type.
// Their element counts evaluate to 8.
var<private> d: array<i32,width>;

// array<i32,height> and array<i32,width> are the same type.
var<private> e: array<i32,width>;
var<private> f: array<i32,height>;

// A structure with four members.
struct Data {
  a: i32,
  b: vec2<f32>,
  c: array<i32,10>,
  d: array<f32>, // last comma is optional
}