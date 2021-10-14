import { FileValueAccessorDirective } from "./file-value-accessor.directive";

describe("FileValueAccessorDirective", () => {
  it("should create an instance", () => {
    const elementRef = document.createElement("file");
    const directive = new FileValueAccessorDirective({ nativeElement: elementRef });
    expect(directive).toBeTruthy();
  });
});
