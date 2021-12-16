import { Component, NgModule, ViewChild } from "@angular/core";
import {
  CdkDrag,
  CdkDragStart,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray
} from "@angular/cdk/drag-drop";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  @ViewChild(CdkDropListGroup) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList) placeholder: CdkDropList;

  public items: Array<number> = [1, 2, 3, 4, 5];

  public itemSizes: Array<string> = [
    "content-item-c11",
    "content-item-c21",
    "content-item-c11",
    "content-item-c21",
    "content-item-c11"
  ];

  public target: CdkDropList<any>;
  public source: CdkDropList<any>;
  public sourceIndex: number;
  public phElementIndex: number;
  public insertAfter: boolean;

  constructor() {
    this.target = null;
    this.source = null;
  }

  ngAfterViewInit() {
    let phElement = this.placeholder.element.nativeElement;

    phElement.style.display = "none";
    phElement.parentNode.removeChild(phElement);
  }

  add() {
    this.items.push(this.items.length + 1);
  }

  shuffle() {
    this.items.sort(function() {
      return 0.5 - Math.random();
    });
  }

  drop() {
    if (!this.target) return;

    const phElement = this.placeholder.element.nativeElement;
    const parent = phElement.parentNode;

    phElement.style.display = "none";
    parent.removeChild(phElement);
    parent.appendChild(phElement);

    parent.insertBefore(
      this.source.element.nativeElement,
      parent.children[this.sourceIndex]
    );

    console.log(this.sourceIndex, " => ", this.phElementIndex);

    if (this.sourceIndex != this.phElementIndex) {
      moveItemInArray(this.items, this.sourceIndex, this.phElementIndex);
    }

    this.target = null;
    this.source = null;
    this.phElementIndex = undefined;
  }

  enter = (drag: CdkDrag<any>, drop: CdkDropList<any>) => {
    const prevTargetIsDifferent = this.target !== drop;
    this.target = drop;

    if (drop == this.placeholder) return true;

    const phElement = this.placeholder.element.nativeElement;
    const dropElement = drop.element.nativeElement;

    const dropIndex = __indexOf(dropElement.parentNode.children, dropElement);

    if (!this.source) {
      this.source = drag.dropContainer;
      this.sourceIndex = __indexOf(
        dropElement.parentNode.children,
        drag.dropContainer.element.nativeElement
      );

      const sourceElement = this.source.element.nativeElement;

      this.fixPhElementStyling(phElement, sourceElement);

      sourceElement.parentNode.removeChild(sourceElement);
      this.source._dropListRef.start();
    }

    if (prevTargetIsDifferent) {
      const index =
        this.phElementIndex !== undefined
          ? this.phElementIndex
          : this.sourceIndex;
      this.insertAfter = index < dropIndex;
    }

    dropElement.parentNode.insertBefore(
      phElement,
      this.insertAfter ? dropElement.nextSibling : dropElement
    );
    this.phElementIndex = __indexOf(dropElement.parentNode.children, phElement);

    this.placeholder._dropListRef.enter(
      drag._dragRef,
      drag.element.nativeElement.offsetLeft,
      drag.element.nativeElement.offsetTop
    );

    return false;
  };

  private fixPhElementStyling(
    phElement: HTMLElement,
    sourceElement: HTMLElement
  ) {
    phElement.style.width = sourceElement.clientWidth + "px";
    phElement.style.height = sourceElement.clientHeight + "px";

    const size = Array.from(sourceElement.classList).find(c =>
      c.startsWith("content-item-c")
    );

    phElement.style.display = "";
    const oldSize = Array.from(phElement.classList).find(c =>
      c.startsWith("content-item-c")
    );
    if (oldSize) {
      phElement.classList.remove(oldSize);
    }
    if (size) {
      phElement.classList.add(size);
    }
  }
}

function __indexOf(collection, node) {
  return Array.prototype.indexOf.call(collection, node);
}
