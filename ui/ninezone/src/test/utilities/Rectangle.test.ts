/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { Rectangle, Corner, RectangleProps } from "../../ui-ninezone";

describe("Rectangle", () => {
  it("unspecified bounds should be 0", () => {
    const sut = new Rectangle();
    sut.left.should.eq(0);
    sut.top.should.eq(0);
    sut.right.should.eq(0);
    sut.bottom.should.eq(0);
  });

  it("should specify bounds while constructing", () => {
    const sut = new Rectangle(1, 2, 3, 4);
    sut.left.should.eq(1);
    sut.top.should.eq(2);
    sut.right.should.eq(3);
    sut.bottom.should.eq(4);
  });

  it("should create from size with left top at (0, 0)", () => {
    const sut = Rectangle.createFromSize({ width: 10, height: 15 });
    sut.left.should.eq(0);
    sut.top.should.eq(0);
    sut.right.should.eq(10);
    sut.bottom.should.eq(15);
  });

  it("should get size of this rectangle", () => {
    const sut = new Rectangle(-5, 2, 5, 4);
    const size = sut.getSize();
    size.width.should.eq(10);
    size.height.should.eq(2);
  });

  it("should get top left corner", () => {
    const sut = new Rectangle(-5, 2, 5, 4);
    const corner = sut.getCorner(Corner.TopLeft);
    corner.x.should.eq(-5);
    corner.y.should.eq(2);
  });

  it("should get top right corner", () => {
    const sut = new Rectangle(-5, 2, 5, 4);
    const corner = sut.getCorner(Corner.TopRight);
    corner.x.should.eq(5);
    corner.y.should.eq(2);
  });

  it("should get bottom left corner", () => {
    const sut = new Rectangle(-5, 2, 5, 4);
    const corner = sut.getCorner(Corner.BottomLeft);
    corner.x.should.eq(-5);
    corner.y.should.eq(4);
  });

  it("should get bottom right corner", () => {
    const sut = new Rectangle(-5, 2, 5, 4);
    const corner = sut.getCorner(Corner.BottomRight);
    corner.x.should.eq(5);
    corner.y.should.eq(4);
  });

  it("should return offsetted rectangle", () => {
    const sut = new Rectangle(-5, 2, 5, 4);
    const offsetted = sut.offset({ x: 2, y: 3 });
    offsetted.left.should.eq(-3);
    offsetted.top.should.eq(5);
    offsetted.right.should.eq(7);
    offsetted.bottom.should.eq(7);
  });

  it("should return X offsetted rectangle", () => {
    const sut = new Rectangle(-5, 2, 5, 4);
    const offsetted = sut.offsetX(3);
    offsetted.left.should.eq(-2);
    offsetted.top.should.eq(2);
    offsetted.right.should.eq(8);
    offsetted.bottom.should.eq(4);
  });

  it("should return Y offsetted rectangle", () => {
    const sut = new Rectangle(-5, 2, 5, 4);
    const offsetted = sut.offsetY(3);
    offsetted.left.should.eq(-5);
    offsetted.top.should.eq(5);
    offsetted.right.should.eq(5);
    offsetted.bottom.should.eq(7);
  });

  it("should return rectangle with specified height, but with same left and top bounds", () => {
    const sut = new Rectangle(-5, 2, 5, 8);
    const offsetted = sut.setHeight(1);
    offsetted.left.should.eq(-5);
    offsetted.top.should.eq(2);
    offsetted.right.should.eq(5);
    offsetted.bottom.should.eq(3);
  });

  it("should return true if other rectangle is equal", () => {
    const sut = new Rectangle(-5, 2, 5, 8);
    const other: RectangleProps = {
      left: -5,
      top: 2,
      right: 5,
      bottom: 8,
    };
    sut.equals(other).should.true;
  });

  it("should return false if left bound of other rectangle is not equal", () => {
    const sut = new Rectangle(-5, 2, 5, 8);
    const other: RectangleProps = {
      left: 5,
      top: 2,
      right: 5,
      bottom: 8,
    };
    sut.equals(other).should.false;
  });

  it("should return false if top bound of other rectangle is not equal", () => {
    const sut = new Rectangle(-5, 2, 5, 8);
    const other: RectangleProps = {
      left: 5,
      top: 6,
      right: 5,
      bottom: 8,
    };
    sut.equals(other).should.false;
  });

  it("should return false if right bound of other rectangle is not equal", () => {
    const sut = new Rectangle(-5, 2, 5, 8);
    const other: RectangleProps = {
      left: 5,
      top: 6,
      right: 6,
      bottom: 8,
    };
    sut.equals(other).should.false;
  });

  it("should return false if bottom bound of other rectangle is not equal", () => {
    const sut = new Rectangle(-5, 2, 5, 8);
    const other: RectangleProps = {
      left: 5,
      top: 6,
      right: 5,
      bottom: 10,
    };
    sut.equals(other).should.false;
  });

  it("should return true if rectangle contains the point", () => {
    const sut = new Rectangle(-5, 2, 5, 8);
    sut.containsPoint({ x: 2, y: 2 }).should.true;
  });

  it("should return false if rectangle does not contain the point", () => {
    const sut = new Rectangle(-5, 0, 5, 1);
    sut.containsPoint({ x: 2, y: 2 }).should.false;
  });

  it("should return true if rectangle contains other rectangle", () => {
    const sut = new Rectangle(-5, 2, 5, 7);
    const other: RectangleProps = {
      left: -4,
      top: 3,
      right: 4,
      bottom: 6,
    };
    sut.contains(other).should.true;
  });

  it("should return false if rectangle does not contain other rectangle", () => {
    const sut = new Rectangle(-5, 2, 5, 7);
    const other: RectangleProps = {
      left: -4,
      top: 3,
      right: 4,
      bottom: 8,
    };
    sut.contains(other).should.false;
  });

  it("should get top left point", () => {
    const sut = new Rectangle(-5, 2, 5, 4);
    const topLeft = sut.topLeft();
    topLeft.x.should.eq(-5);
    topLeft.y.should.eq(2);
  });

  it("should return true if rectangle intersects other rectangle", () => {
    const sut = new Rectangle(-5, 2, 5, 7);
    const other: RectangleProps = {
      left: -4,
      top: 3,
      right: 4,
      bottom: 8,
    };
    sut.intersects(other).should.true;
  });

  it("should return false if rectangle does not intersect other rectangle", () => {
    const sut = new Rectangle(-5, 2, 5, 7);
    const other: RectangleProps = {
      left: -4,
      top: 3,
      right: 4,
      bottom: 6,
    };
    sut.intersects(other).should.true;
  });

  it("should outer merge with other rectangle", () => {
    const sut = new Rectangle(0, 5, 10, 20);
    const other: RectangleProps = {
      left: 0,
      top: 20,
      right: 10,
      bottom: 30,
    };
    const merged = sut.outerMergeWith(other);
    merged.left.should.eq(0);
    merged.top.should.eq(5);
    merged.right.should.eq(10);
    merged.bottom.should.eq(30);
  });

  it("should return new positioned rectangle", () => {
    const sut = new Rectangle(0, 5, 10, 20);
    const positioned = sut.setPosition({ x: 10, y: 1 });

    sut.should.not.eq(positioned);
    positioned.left.should.eq(10);
    positioned.top.should.eq(1);
    positioned.right.should.eq(20);
    positioned.bottom.should.eq(16);
  });

  it("should contain vertically in rectangle", () => {
    const sut = new Rectangle(1, 5, 11, 17);
    const contained = sut.containVerticallyIn({
      left: 2,
      top: 8,
      right: 10,
      bottom: 12,
    });

    contained.left.should.eq(1);
    contained.right.should.eq(11);
    contained.top.should.eq(8);
    contained.bottom.should.eq(20);
  });

  it("should contain horizontally in rectangle", () => {
    const sut = new Rectangle(1, 5, 11, 17);
    const contained = sut.containHorizontallyIn({
      left: 2,
      top: 8,
      right: 10,
      bottom: 12,
    });

    contained.left.should.eq(2);
    contained.right.should.eq(12);
    contained.top.should.eq(5);
    contained.bottom.should.eq(17);
  });
});
