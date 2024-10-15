function Shape() {
    this.area = function () {
      // Abstract method, should be implemented by sub-classes
    }
}   

// AREA IS A GENERAL BEHAVIOR OF SHAPE
// IT SHOULD BE IMPLEMENTED BY SUB-CLASSES


// override the area method of the Shape class in the Rectangle class.
function Rectangle(width, height) {
    Shape.call(this);
    this.width = width;
    this.height = height;
    this.area = function () {
        return this.width * this.height;
    }
}

let rect = new Rectangle(3, 4);
console.log(rect.area()); // 12
