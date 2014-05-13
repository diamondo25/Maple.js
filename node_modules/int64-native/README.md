# int64-native

`int64-native` is a simple `uint64_t` wrapper for JavaScript, enabling the
use of 64-bit unsigned integers from node.

## Why?

`int64-native` was originally developed to support reasonable handling of
64-bit ID columns in databases. There are other 64-bit integer modules out
there, but AFAICT all of them are pure JavaScript; native `uint64_t` seemed
like a better way to handle this!

The one caveat is that you won't be able to use this browser-side. However,
you can use the string representation to pass 64-bit values from server to
client.

## Installing

### via npm

    npm install int64-native

### from source

    git clone git://github.com/candu/node-int64-native.git
    cd node-int64-native
    npm install

`int64-native` is built using `node-gyp`.

## Usage

All of the following examples are borrowed from `test/int64.js`, which you
can run via

    npm test

### Including

`require()` gives you direct access to the constructor:

    var Int64 = require('int64-native');

### Constructor

You can create an `Int64` as follows:

    var x = new Int64(),
        y = new Int64(42),
        z = new Int64(0xfedcba98, 0x76543210),
        w = new Int64('0xfedcba9876543210')
    expect(x.toString()).to.equal('0x0000000000000000');
    expect(y.toString()).to.equal('0x000000000000002a');
    expect(z.toString()).to.equal('0xfedcba9876543210');
    expect(w.toString()).to.equal('0xfedcba9876543210');

The last two methods allow you to represent `uint64_t` values larger than
`(1 << 53) - 1`.

### Type Conversions

`Int64` exposes `toNumber()`, `valueOf()` for converting to numeric values:

    var a = new Int64(2),
        b = new Int64(3);
    expect(a + b).to.equal(5);
    var x = new Int64(),
        y = new Int64(42),
        z = new Int64(0xfedcba98, 0x76543210),
        w = new Int64('0xfedcba9876543210')
    expect(+x).to.equal(0);
    expect(+y).to.equal(42);
    expect(+z).to.equal(Infinity);
    expect(+w).to.equal(Infinity);

Values larger than `(1 << 53) - 1` will be converted to `Infinity`, since
they cannot be accurately represented using JavaScript's `Number` type.

As you can see from the examples so far, `toString()` produces the hex string
corresponding to an `Int64`.

### Conversion to Decimal String

`Int64` also exposes `toSignedDecimalString()` and `toUnsignedDecimalString()` for converting to decimal strings:

    var minusOne = new Int64('0xFFFFFFFFFFFFFFFF');
    expect(minusOne.toSignedDecimalString()).to.equal('-1');
    expect(minusOne.toUnsignedDecimalString()).to.equal('18446744073709551615');

### Comparison

For cases where you wish to sort or compare `Int64` values, `equals()` and
`compare()` are provided:

    var a = new Int64(2),
        b = new Int64(3);
    expect(a.equals(a)).to.be.true;
    expect(a.equals(b)).to.be.false;
    expect(a.compare(a)).to.equal(0);
    expect(a.compare(b)).to.equal(-1);
    expect(b.compare(a)).to.equal(1);

### Bit Manipulation

There are several operations for bit-level manipulation of `Int64` values:

    var x = new Int64('0xfedcba9876543210');
    expect(x.high32().toString(16)).to.equal('fedcba98');
    expect(x.low32().toString(16)).to.equal('76543210');
    var y = x.and(new Int64(0xffff)),
        z = x.or(new Int64(0xffff)),
        w = x.xor(new Int64('fffffffffffffffff'));
    expect(y.toString()).to.equal('0x0000000000003210');
    expect(z.toString()).to.equal('0xfedcba987654ffff');
    expect(w.toString()).to.equal('0x0123456789abcdef');
    var a = new Int64(7),
        b = a.shiftLeft(1),
        c = a.shiftRight(1);
    expect(b.toString()).to.equal('0x000000000000000e');
    expect(c.toString()).to.equal('0x0000000000000003');
