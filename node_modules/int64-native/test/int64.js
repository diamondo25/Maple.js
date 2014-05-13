var Int64 = require('../int64'),
    chai = require('chai'),
    expect = chai.expect;

describe('Int64', function testInt64() {
  it('can be constructed', function testConstructor() {
    var x = new Int64(),
        y = new Int64(42),
        z = new Int64(0xfedcba98, 0x76543210),
        w = new Int64('0xfedcba9876543210'),
        r = new Int64('372528006791240803');
    expect(x.toString()).to.equal('0x0000000000000000');
    expect(y.toString()).to.equal('0x000000000000002a');
    expect(z.toString()).to.equal('0xfedcba9876543210');
    expect(w.toString()).to.equal('0xfedcba9876543210');
    expect(r.toString()).to.equal('0x052b7c3f99ad1c63');
  });

  it('can be converted to Number', function testNumberConversion() {
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
  });

  it('can be compared', function testComparison() {
    var a = new Int64(2),
        b = new Int64(3);
    expect(a.equals(a)).to.be.true;
    expect(a.equals(b)).to.be.false;
    expect(a.compare(a)).to.equal(0);
    expect(a.compare(b)).to.equal(-1);
    expect(b.compare(a)).to.equal(1);
  });

  it('can be bit-manipulated', function testBitManipulation() {
    var x = new Int64('0xfedcba9876543210');
    expect(x.high32().toString(16)).to.equal('fedcba98');
    expect(x.low32().toString(16)).to.equal('76543210');
    var y = x.and(new Int64(0xffff)),
        z = x.or(new Int64(0xffff)),
        w = x.xor(new Int64('0xffffffffffffffff'));
    expect(y.toString()).to.equal('0x0000000000003210');
    expect(z.toString()).to.equal('0xfedcba987654ffff');
    expect(w.toString()).to.equal('0x0123456789abcdef');
    expect(x.and(0xffff).toString()).to.equal('0x0000000000003210');
    expect(x.or(0xffff).toString()).to.equal('0xfedcba987654ffff');
    expect(x.xor(0xffff).toString()).to.equal('0xfedcba987654cdef');
    expect(x.and(0x1ffffffff).toString()).to.equal('0x0000000076543210');
    expect(x.or(0x1ffffffff).toString()).to.equal('0xfedcba99ffffffff');
    expect(x.xor(0x1ffffffff).toString()).to.equal('0xfedcba9989abcdef');
    var a = new Int64(7),
        b = a.shiftLeft(1),
        c = a.shiftRight(1);
    expect(b.toString()).to.equal('0x000000000000000e');
    expect(c.toString()).to.equal('0x0000000000000003');
  });

  it('can be converted to a decimal string', function testDecimalString() {
    var positive = new Int64('0x52B7C3F99AD1C63');
    expect(positive.toSignedDecimalString()).to.equal('372528006791240803');
    expect(positive.toUnsignedDecimalString()).to.equal('372528006791240803');

    var minusOne = new Int64('0xFFFFFFFFFFFFFFFF');
    expect(minusOne.toSignedDecimalString()).to.equal('-1');
    expect(minusOne.toUnsignedDecimalString()).to.equal('18446744073709551615');

    var jsOverflow = new Int64('0x002fffffffffffff');
    expect(jsOverflow.toSignedDecimalString()).to.equal('13510798882111487');
    expect(jsOverflow.toUnsignedDecimalString()).to.equal('13510798882111487');

    var decimal = new Int64('13510798882111487');
    expect(decimal.toSignedDecimalString()).to.equal('13510798882111487');
    expect(decimal.toUnsignedDecimalString()).to.equal('13510798882111487');
  });

  it('can be added', function testAdd() {
    var a = new Int64(3),
        b = new Int64(2),
        c = new Int64('0xfffffffffffffffe');
    expect(a.add(b).equals(new Int64(5))).to.be.true;
    expect(a.add(4).equals(new Int64(7))).to.be.true;

    // unsigned integer overflow
    expect(c.add(3).equals(new Int64(1))).to.be.true;

    // numbers larger than int32
    expect(a.add(0x100000000).toString()).to.equal('0x0000000100000003');
  });

  it('can be subtracted', function testSub() {
    var a = new Int64(3),
        b = new Int64(2),
        c = new Int64('0xffffffffffffffff');
    expect(a.sub(b).equals(new Int64(1))).to.be.true;
    expect(a.sub(1).equals(new Int64(2))).to.be.true;

    // unsigned integer underflow
    expect(a.sub(4).equals(new Int64('0xffffffffffffffff'))).to.be.true;

    // numbers larger than int32
    expect(c.sub(0x100000000).toString()).to.equal('0xfffffffeffffffff');
  });
});
