/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Tools */

import { BeDuration } from "@bentley/bentleyjs-core";
import { Point2d, Point3d, PolygonOps, Angle, Constant } from "@bentley/geometry-core";
import { GeometryStreamProps, IModelError } from "@bentley/imodeljs-common";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { LocateFilterStatus, LocateResponse } from "../ElementLocateManager";
import { FuzzySearch, FuzzySearchResults } from "../FuzzySearch";
import { HitDetail } from "../HitDetail";
import { IModelApp } from "../IModelApp";
import { ToolSettingsPropertyRecord, ToolSettingsPropertySyncItem } from "../properties/ToolSettingsValue";
import { DecorateContext, DynamicsContext } from "../ViewContext";
import { ScreenViewport, Viewport } from "../Viewport";

/** Settings that control the behavior of built-in tools. Applications may modify these values.
 * @public
 */
export class ToolSettings {
  /** Duration of animations of viewing operations. */
  public static animationTime = BeDuration.fromMilliseconds(260);
  /** Two tap must be within this period to be a double tap. */
  public static doubleTapTimeout = BeDuration.fromMilliseconds(250);
  /** Two clicks must be within this period to be a double click. */
  public static doubleClickTimeout = BeDuration.fromMilliseconds(500);
  /** Number of screen inches of movement allowed between clicks to still qualify as a double-click.  */
  public static doubleClickToleranceInches = 0.05;
  /** Duration without movement before a no-motion event is generated. */
  public static noMotionTimeout = BeDuration.fromMilliseconds(10);
  /** If true, view rotation tool keeps the up vector (worldZ) aligned with screenY. */
  public static preserveWorldUp = true;
  /** Delay with a touch on the surface before a move operation begins. */
  public static touchMoveDelay = BeDuration.fromMilliseconds(50);
  /** Delay with the mouse down before a drag operation begins. */
  public static startDragDelay = BeDuration.fromMilliseconds(110);
  /** Distance in screen inches a touch point must move before being considered motion. */
  public static touchMoveDistanceInches = 0.15;
  /** Distance in screen inches the cursor must move before a drag operation begins. */
  public static startDragDistanceInches = 0.15;
  /** Radius in screen inches to search for elements that anchor viewing operations. */
  public static viewToolPickRadiusInches = 0.20;
  /** Camera angle enforced for walk tool. */
  public static walkCameraAngle = Angle.createDegrees(75.6);
  /** Whether the walk tool enforces worldZ be aligned with screenY */
  public static walkEnforceZUp = false;
  /** Speed, in meters per second, for the walk tool. */
  public static walkVelocity = 3.5;
  /** Scale factor applied for wheel events with "per-line" modifier. */
  public static wheelLineFactor = 40;
  /** Scale factor applied for wheel events with "per-page" modifier. */
  public static wheelPageFactor = 120;
  /** When the zoom-with-wheel tool (with camera enabled) gets closer than this distance to an obstacle, it "bumps" through. */
  public static wheelZoomBumpDistance = Constant.oneCentimeter;
  /** Scale factor for zooming with mouse wheel. */
  public static wheelZoomRatio = 1.75;
}

/** @public */
export type ToolType = typeof Tool;

/** @public */
export type ToolList = ToolType[];

/** @public */
export enum BeButton { Data = 0, Reset = 1, Middle = 2 }

/** @public */
export enum CoordinateLockOverrides {
  None = 0,
  ACS = 1 << 1,
  Grid = 1 << 2,     // also overrides unit lock
  All = 0xffff,
}

/** The *source* that generated an event.
 * @public
 */
export enum InputSource {
  /** Source not defined */
  Unknown = 0,
  /** From a mouse or other pointing device */
  Mouse = 1,
  /** From a touch screen */
  Touch = 2,
}

/** The *source* that generated a coordinate.
 * @public
 */
export enum CoordSource {
  /** Event was created by an action from the user */
  User = 0,
  /** Event was created by a program or by a precision keyin */
  Precision = 1,
  /** Event was created by a tentative point */
  TentativePoint = 2,
  /** Event was created by snapping to an element */
  ElemSnap = 3,
}

/** Numeric mask for a set of modifier keys (control, shift, and alt).
 * @public
 */
export enum BeModifierKeys { None = 0, Control = 1 << 0, Shift = 1 << 1, Alt = 1 << 2 }

/** @public */
export class BeButtonState {
  private readonly _downUorPt: Point3d = new Point3d();
  private readonly _downRawPt: Point3d = new Point3d();
  public downTime: number = 0;
  public isDown: boolean = false;
  public isDoubleClick: boolean = false;
  public isDragging: boolean = false;
  public inputSource: InputSource = InputSource.Unknown;

  public get downRawPt() { return this._downRawPt; }
  public set downRawPt(pt: Point3d) { this._downRawPt.setFrom(pt); }
  public get downUorPt() { return this._downUorPt; }
  public set downUorPt(pt: Point3d) { this._downUorPt.setFrom(pt); }

  public init(downUorPt: Point3d, downRawPt: Point3d, downTime: number, isDown: boolean, isDoubleClick: boolean, isDragging: boolean, source: InputSource) {
    this.downUorPt = downUorPt;
    this.downRawPt = downRawPt;
    this.downTime = downTime;
    this.isDown = isDown;
    this.isDoubleClick = isDoubleClick;
    this.isDragging = isDragging;
    this.inputSource = source;
  }
}

/** Properties for constructing a BeButtonEvent
 * @public
 */
export interface BeButtonEventProps {
  /** The point for this event, in world coordinates.
   * @note these coordinates may have been *adjusted* for some reason (e.g. snapping, locks, etc.) from the [[rawPoint]].
   */
  point?: Point3d;
  /** The *raw* (unadjusted) point for this event, in world coordinates. */
  rawPoint?: Point3d;
  /** The point, in screen coordinates for this event.
   * @note generally the z value is not useful, but some 3d pointing devices do supply it.
   */
  viewPoint?: Point3d;
  /** The [[ScreenViewport]] for the BeButtonEvent. If undefined, this event is invalid. */
  viewport?: ScreenViewport;
  /** How the coordinate values were generated (either from an action by the user or from a program.) */
  coordsFrom?: CoordSource;
  keyModifiers?: BeModifierKeys;
  /** The mouse button for this event. */
  button?: BeButton;
  /** If true, this event was generated from a mouse-down transition, false from a button-up transition. */
  isDown?: boolean;
  /** If true, this is the second down in a rapid double-click of the same button. */
  isDoubleClick?: boolean;
  /** If true, this event was created by pressing, holding, and then moving a mouse button. */
  isDragging?: boolean;
  /** Whether this event came from a pointing device (e.g. mouse) or a touch device. */
  inputSource?: InputSource;
}

/** Object sent to Tools that holds information about button/touch/wheel events.
 * @public
 */
export class BeButtonEvent implements BeButtonEventProps {
  private readonly _point: Point3d = new Point3d();
  private readonly _rawPoint: Point3d = new Point3d();
  private readonly _viewPoint: Point3d = new Point3d();
  /** The [[ScreenViewport]] from which this BeButtonEvent was generated. If undefined, this event is invalid. */
  public viewport?: ScreenViewport;
  /** How the coordinate values were generated (either from an action by the user or from a program.) */
  public coordsFrom = CoordSource.User;
  /** The keyboard modifiers that were pressed when the event was generated. */
  public keyModifiers = BeModifierKeys.None;
  /** If true, this event was generated from a mouse-down transition, false from a button-up transition. */
  public isDown = false;
  /** If true, this is the second down in a rapid double-click of the same button. */
  public isDoubleClick = false;
  /** If true, this event was created by pressing, holding, and then moving a mouse button. */
  public isDragging = false;
  /** The mouse button that created this event. */
  public button = BeButton.Data;
  /** Whether this event came from a pointing device (e.g. mouse) or a touch device. */
  public inputSource = InputSource.Unknown;

  public constructor(props?: BeButtonEventProps) { if (props) this.init(props); }

  /** Determine whether this BeButtonEvent has valid data.
   * @note BeButtonEvents may be constructed as "blank", and are not considered to hold valid data unless the [[viewport]] member is defined.
   */
  public get isValid(): boolean { return this.viewport !== undefined; }
  /** The point for this event, in world coordinates.
   * @note these coordinates may have been *adjusted* for some reason (e.g. snapping, locks, etc.) from the [[rawPoint]].
   */
  public get point() { return this._point; }
  public set point(pt: Point3d) { this._point.setFrom(pt); }
  /** The *raw* (unadjusted) point for this event, in world coordinates. */
  public get rawPoint() { return this._rawPoint; }
  public set rawPoint(pt: Point3d) { this._rawPoint.setFrom(pt); }
  /** The point, in screen coordinates for this event.
   * @note generally the z value is not useful, but some 3d pointing devices do supply it.
   */
  public get viewPoint() { return this._viewPoint; }
  public set viewPoint(pt: Point3d) { this._viewPoint.setFrom(pt); }

  /** Mark this BeButtonEvent as invalid. Can only become valid again by calling [[init]] */
  public invalidate() { this.viewport = undefined; }

  /** Initialize the values of this BeButtonEvent. */
  public init(props: BeButtonEventProps) {
    if (undefined !== props.point) this.point = props.point;
    if (undefined !== props.rawPoint) this.rawPoint = props.rawPoint;
    if (undefined !== props.viewPoint) this.viewPoint = props.viewPoint;
    if (undefined !== props.viewport) this.viewport = props.viewport;
    if (undefined !== props.coordsFrom) this.coordsFrom = props.coordsFrom;
    if (undefined !== props.keyModifiers) this.keyModifiers = props.keyModifiers;
    if (undefined !== props.isDown) this.isDown = props.isDown;
    if (undefined !== props.isDoubleClick) this.isDoubleClick = props.isDoubleClick;
    if (undefined !== props.isDragging) this.isDragging = props.isDragging;
    if (undefined !== props.button) this.button = props.button;
    if (undefined !== props.inputSource) this.inputSource = props.inputSource;
  }

  /** Determine whether the control key was pressed  */
  public get isControlKey() { return 0 !== (this.keyModifiers & BeModifierKeys.Control); }
  /** Determine whether the shift key was pressed  */
  public get isShiftKey() { return 0 !== (this.keyModifiers & BeModifierKeys.Shift); }
  /** Determine whether the alt key was pressed  */
  public get isAltKey() { return 0 !== (this.keyModifiers & BeModifierKeys.Alt); }

  /** Copy the values from another BeButtonEvent into this BeButtonEvent */
  public setFrom(src: BeButtonEvent): this {
    this.point = src.point;
    this.rawPoint = src.rawPoint;
    this.viewPoint = src.viewPoint;
    this.viewport = src.viewport;
    this.coordsFrom = src.coordsFrom;
    this.keyModifiers = src.keyModifiers;
    this.isDown = src.isDown;
    this.isDoubleClick = src.isDoubleClick;
    this.isDragging = src.isDragging;
    this.button = src.button;
    this.inputSource = src.inputSource;
    return this;
  }
  /** Make a copy of this BeButtonEvent. */
  public clone(): this { return new (this.constructor as typeof BeButtonEvent)(this) as this; }
}

/** Properties for initializing a BeTouchEvent
 * @public
 */
export interface BeTouchEventProps extends BeButtonEventProps {
  touchEvent: TouchEvent;
}

/** A ButtonEvent generated by touch input.
 * @public
 */
export class BeTouchEvent extends BeButtonEvent implements BeTouchEventProps {
  public tapCount: number = 0;
  public touchEvent: TouchEvent;
  public get touchCount(): number { return this.touchEvent.targetTouches.length; }
  public get isSingleTouch(): boolean { return 1 === this.touchCount; }
  public get isTwoFingerTouch(): boolean { return 2 === this.touchCount; }
  public get isSingleTap(): boolean { return 1 === this.tapCount && 1 === this.touchCount; }
  public get isDoubleTap(): boolean { return 2 === this.tapCount && 1 === this.touchCount; }
  public get isTwoFingerTap(): boolean { return 1 === this.tapCount && 2 === this.touchCount; }
  public constructor(props: BeTouchEventProps) {
    super(props);
    this.touchEvent = props.touchEvent;
  }

  public setFrom(src: BeTouchEvent): this {
    super.setFrom(src);
    this.touchEvent = src.touchEvent;
    this.tapCount = src.tapCount;
    return this;
  }
  public static getTouchPosition(touch: Touch, vp: ScreenViewport): Point2d {
    const rect = vp.getClientRect();
    return Point2d.createFrom({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
  }
  public static getTouchListCentroid(list: TouchList, vp: ScreenViewport): Point2d | undefined {
    switch (list.length) {
      case 0: {
        return undefined;
      }
      case 1: {
        return this.getTouchPosition(list[0], vp);
      }
      case 2: {
        return this.getTouchPosition(list[0], vp).interpolate(0.5, this.getTouchPosition(list[1], vp));
      }
      default: {
        const points: Point2d[] = [];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < list.length; i++) {
          points.push(this.getTouchPosition(list[i], vp));
        }
        const centroid = Point2d.createZero();
        PolygonOps.centroidAndAreaXY(points, centroid);
        return centroid;
      }
    }
  }
  public static findTouchById(list: TouchList, id: number): Touch | undefined {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < list.length; i++) {
      if (id === list[i].identifier)
        return list[i];
    }
    return undefined;
  }
}

/** Properties for constructing a BeWheelEvent
 * @public
 */
export interface BeWheelEventProps extends BeButtonEventProps {
  wheelDelta?: number;
}
/** A BeButtonEvent generated by movement of a mouse wheel.
 * @note wheel events include mouse location.
 * @public
 */
export class BeWheelEvent extends BeButtonEvent implements BeWheelEventProps {
  public wheelDelta: number = 0;
  public constructor(props?: BeWheelEventProps) {
    super(props);
    if (props && props.wheelDelta !== undefined) this.wheelDelta = props.wheelDelta;
  }
  public setFrom(src: BeWheelEvent): this {
    super.setFrom(src);
    this.wheelDelta = src.wheelDelta;
    return this;
  }
}

/** Base Tool class for writing an immediate tool that executes it's assigned task immediately without further input.
 * @see [[InteractiveTool]] for a base Tool class to handle user input events from a Viewport.
 * @see [Tools]($docs/learning/frontend/tools.md)
 * @public
 */
export class Tool {
  /** If true, this Tool will not appear in the list from [[ToolRegistry.getToolList]]. This should be overridden in subclasses to hide them. */
  public static hidden = false;
  /** The unique string that identifies this tool. This must be overridden in every subclass. */
  public static toolId = "";
  /** The [I18NNamespace]($i18n) that provides localized strings for this Tool. Subclasses should override this. */
  public static namespace: I18NNamespace;
  public constructor(..._args: any[]) { }

  private static _keyin?: string;
  private static _flyover?: string;
  private static _description?: string;
  private static get _localizeBase() { return this.namespace.name + ":tools." + this.toolId; }
  private static get _keyinKey() { return this._localizeBase + ".keyin"; }
  private static get _flyoverKey() { return this._localizeBase + ".flyover"; }
  private static get _descriptionKey() { return this._localizeBase + ".description"; }

  /**
   * Register this Tool class with the ToolRegistry.
   * @param namespace optional namespace to supply to ToolRegistry.register. If undefined, use namespace from superclass.
   */
  public static register(namespace?: I18NNamespace) { IModelApp.tools.register(this, namespace); }

  /**
   * Get the localized keyin string for this Tool class. This returns the value of "tools." + this.toolId + ".keyin" from the
   * .json file for the current locale of its registered Namespace (e.g. "en/MyApp.json")
   */
  public static get keyin(): string { return this._keyin ? this._keyin : (this._keyin = IModelApp.i18n && IModelApp.i18n.translate(this._keyinKey)); }

  /**
   * Get the localized flyover for this Tool class. This returns the value of "tools." + this.toolId + ".flyover" from the
   * .json file for the current locale of its registered Namespace (e.g. "en/MyApp.json"). If that key is not in the localization namespace,
   * the keyin property is returned.
   */
  public static get flyover(): string { return this._flyover ? this._flyover : (this._flyover = IModelApp.i18n && IModelApp.i18n.translate([this._flyoverKey, this._keyinKey])); }

  /**
   * Get the localized description for this Tool class. This returns the value of "tools." + this.toolId + ".description" from the
   * .json file for the current locale of its registered Namespace (e.g. "en/MyApp.json"). If that key is not in the localization namespace,
   * the flyover property is returned.
   */
  public static get description(): string { return this._description ? this._description : (this._description = IModelApp.i18n && IModelApp.i18n.translate([this._descriptionKey, this._flyoverKey, this._keyinKey])); }

  /**
   * Get the toolId string for this Tool class. This string is used to identify the Tool in the ToolRegistry and is used to localize
   * the keyin, description, etc. from the current locale.
   */
  public get toolId(): string { return (this.constructor as ToolType).toolId; }

  /** Get the localized keyin string from this Tool's class */
  public get keyin(): string { return (this.constructor as ToolType).keyin; }

  /** Get the localized flyover string from this Tool's class */
  public get flyover(): string { return (this.constructor as ToolType).flyover; }

  /** Get the localized description string from this Tool's class */
  public get description(): string { return (this.constructor as ToolType).description; }

  /**
   * Run this instance of a Tool. Subclasses should override to perform some action.
   * @returns `true` if the tool executed successfully.
   */
  public run(..._arg: any[]): boolean { return true; }
}

/** @public */
export enum EventHandled { No = 0, Yes = 1 }

/** A Tool that may be installed, via [[ToolAdmin]], to handle user input. The ToolAdmin manages the currently installed ViewingTool, PrimitiveTool,
 * InputCollector, and IdleTool. Each must derive from this class and there may only be one of each type installed at a time.
 * @public
 */
export abstract class InteractiveTool extends Tool {

  /** Used to avoid sending tools up events for which they did not receive the down event. */
  public receivedDownEvent = false;

  /** Override to execute additional logic when tool is installed. Return false to prevent this tool from becoming active */
  public onInstall(): boolean { return true; }

  /** Override to execute additional logic after tool becomes active */
  public onPostInstall(): void { }

  public abstract exitTool(): void;

  /** Override Call to reset tool to initial state */
  public onReinitialize(): void { }

  /** Invoked when the tool becomes no longer active, to perform additional cleanup logic */
  public onCleanup(): void { }

  /** Notification of a ViewTool or InputCollector starting and this tool is being suspended.
   * @note Applies only to PrimitiveTool and InputCollector, a ViewTool can't be suspended.
   */
  public onSuspend(): void { }

  /** Notification of a ViewTool or InputCollector exiting and this tool is being unsuspended.
   *  @note Applies only to PrimitiveTool and InputCollector, a ViewTool can't be suspended.
   */
  public onUnsuspend(): void { }

  /** Called to support operations on pickable decorations, like snapping. */
  public testDecorationHit(_id: string): boolean { return false; }

  /** Called to allow snapping to pickable decoration geometry.
   * @note Snap geometry can be different from decoration geometry (ex. center point of a + symbol). Valid decoration geometry for snapping should be "stable" and not change based on the current cursor location.
   */
  public getDecorationGeometry(_hit: HitDetail): GeometryStreamProps | undefined { return undefined; }

  /**
   * Called to allow an active tool to display non-element decorations in overlay mode.
   * This method is NOT called while the tool is suspended by a viewing tool or input collector.
   */
  public decorate(_context: DecorateContext): void { }

  /**
   * Called to allow a suspended tool to display non-element decorations in overlay mode.
   * This method is ONLY called when the tool is suspended by a viewing tool or input collector.
   * @note Applies only to PrimitiveTool and InputCollector, a ViewTool can't be suspended.
   */
  public decorateSuspended(_context: DecorateContext): void { }

  /** Invoked when the reset button is pressed.
   * @return No by default. Sub-classes may ascribe special meaning to this status.
   * @note To support right-press menus, a tool should put its reset event processing in onResetButtonUp instead of onResetButtonDown.
   */
  public async onResetButtonDown(_ev: BeButtonEvent): Promise<EventHandled> { return EventHandled.No; }
  /** Invoked when the reset button is released.
   * @return No by default. Sub-classes may ascribe special meaning to this status.
   */
  public async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled> { return EventHandled.No; }

  /** Invoked when the data button is pressed.
   * @return No by default. Sub-classes may ascribe special meaning to this status.
   */
  public async onDataButtonDown(_ev: BeButtonEvent): Promise<EventHandled> { return EventHandled.No; }
  /** Invoked when the data button is released.
   * @return No by default. Sub-classes may ascribe special meaning to this status.
   */
  public async onDataButtonUp(_ev: BeButtonEvent): Promise<EventHandled> { return EventHandled.No; }

  /** Invoked when the middle mouse button is pressed.
   * @return Yes if event completely handled by tool and event should not be passed on to the IdleTool.
   */
  public async onMiddleButtonDown(_ev: BeButtonEvent): Promise<EventHandled> { return EventHandled.No; }

  /** Invoked when the middle mouse button is released.
   * @return Yes if event completely handled by tool and event should not be passed on to the IdleTool.
   */
  public async onMiddleButtonUp(_ev: BeButtonEvent): Promise<EventHandled> { return EventHandled.No; }

  /** Invoked when the cursor is moving */
  public async onMouseMotion(_ev: BeButtonEvent): Promise<void> { }

  /** Invoked when the cursor is not moving */
  public async onMouseNoMotion(_ev: BeButtonEvent): Promise<void> { }

  /** Invoked when the cursor was previously moving, and has stopped moving. */
  public async onMouseMotionStopped(_ev: BeButtonEvent): Promise<void> { }

  /** Invoked when the cursor begins moving while a button is depressed.
   * @return Yes if event completely handled by tool and event should not be passed on to the IdleTool.
   */
  public async onMouseStartDrag(_ev: BeButtonEvent): Promise<EventHandled> { return EventHandled.No; }
  /** Invoked when the button is released after onMouseStartDrag.
   * @note default placement tool behavior is to treat press, drag, and release of data button the same as click, click by calling onDataButtonDown.
   * @return Yes if event completely handled by tool and event should not be passed on to the IdleTool.
   */
  public async onMouseEndDrag(ev: BeButtonEvent): Promise<EventHandled> { if (BeButton.Data !== ev.button) return EventHandled.No; if (ev.isDown) return this.onDataButtonDown(ev); const downEv = ev.clone(); downEv.isDown = true; return this.onDataButtonDown(downEv); }

  /** Invoked when the mouse wheel moves.
   * @return Yes if event completely handled by tool and event should not be passed on to the IdleTool.
   */
  public async onMouseWheel(_ev: BeWheelEvent): Promise<EventHandled> { return EventHandled.No; }

  /** Called when Control, Shift, or Alt modifier keys are pressed or released.
   * @param _wentDown up or down key event
   * @param _modifier The modifier key mask
   * @param _event The event that caused this call
   * @return Yes to refresh view decorations or update dynamics.
   */
  public async onModifierKeyTransition(_wentDown: boolean, _modifier: BeModifierKeys, _event: KeyboardEvent): Promise<EventHandled> { return EventHandled.No; }

  /** Called when any key is pressed or released.
   * @param _wentDown up or down key event
   * @param _keyEvent The KeyboardEvent
   * @return Yes to prevent further processing of this event
   * @see [[onModifierKeyTransition]]
   */
  public async onKeyTransition(_wentDown: boolean, _keyEvent: KeyboardEvent): Promise<EventHandled> { return EventHandled.No; }

  /** Called when user adds a touch point by placing a finger or stylus on the surface. */
  public async onTouchStart(_ev: BeTouchEvent): Promise<void> { }
  /** Called when user removes a touch point by lifting a finger or stylus from the surface. */
  public async onTouchEnd(_ev: BeTouchEvent): Promise<void> { }
  /** Called when the last touch point is removed from the surface completing the current gesture. This is a convenience event sent following onTouchEnd when no target touch points remain on the surface. */
  public async onTouchComplete(_ev: BeTouchEvent): Promise<void> { }
  /** Called when a touch point is interrupted in some way and needs to be dropped from the list of target touches. */
  public async onTouchCancel(_ev: BeTouchEvent): Promise<void> { }
  /** Called when a touch point moves along the surface. */
  public async onTouchMove(_ev: BeTouchEvent): Promise<void> { }

  /** Called after at least one touch point has moved for an appreciable time and distance along the surface to not be considered a tap.
   * @param _ev The event that caused this call
   * @param _startEv The event from the last call to onTouchStart
   * @return Yes if event completely handled by tool and event should not be passed on to the IdleTool.
   */
  public async onTouchMoveStart(_ev: BeTouchEvent, _startEv: BeTouchEvent): Promise<EventHandled> { return EventHandled.No; }

  /** Called when touch point(s) are added and removed from a surface within a small time window without any touch point moving.
   * @param _ev The event that caused this call
   * @return Yes if event completely handled by tool and event should not be passed on to the IdleTool.
   * @note A double or triple tap event will not be preceded by a single tap event.
   */
  public async onTouchTap(_ev: BeTouchEvent): Promise<EventHandled> { return EventHandled.No; }

  public isCompatibleViewport(_vp: Viewport, _isSelectedViewChange: boolean): boolean { return true; }
  public isValidLocation(_ev: BeButtonEvent, _isButtonEvent: boolean): boolean { return true; }

  /**
   * Called when active view changes. Tool may choose to restart or exit based on current view type.
   * @param previous The previously active view.
   * @param current The new active view.
   */
  public onSelectedViewportChanged(_previous: Viewport | undefined, _current: Viewport | undefined): void { }

  /**
   * Invoked before the locate tooltip is displayed to retrieve the information about the located element. Allows the tool to override the toolTip.
   * @param hit The HitDetail whose info is needed.
   * @return A Promise for the HTMLElement or string to describe the hit.
   * @note If you override this method, you may decide whether to call your superclass' implementation or not (it is not required).
   */
  public async getToolTip(_hit: HitDetail): Promise<HTMLElement | string> { return _hit.getToolTip(); }

  /** Fill the supplied button event from the current cursor location.   */
  public getCurrentButtonEvent(ev: BeButtonEvent): void { IModelApp.toolAdmin.fillEventFromCursorLocation(ev); }

  /** Call to find out if dynamics are currently active. */
  public get isDynamicsStarted(): boolean { return IModelApp.viewManager.inDynamicsMode; }

  /** Call to initialize dynamics mode. While dynamics are active onDynamicFrame will be called. Dynamics are typically only used by a PrimitiveTool that creates or modifies geometric elements. */
  public beginDynamics(): void { IModelApp.toolAdmin.beginDynamics(); }

  /** Call to terminate dynamics mode. */
  public endDynamics(): void { IModelApp.toolAdmin.endDynamics(); }

  /** Called to allow Tool to display dynamic elements. */
  public onDynamicFrame(_ev: BeButtonEvent, _context: DynamicsContext): void { }

  /** Invoked to allow tools to filter which elements can be located.
   * @return Reject if hit is unacceptable for this tool (fill out response with explanation, if it is defined)
   */
  public async filterHit(_hit: HitDetail, _out?: LocateResponse): Promise<LocateFilterStatus> { return LocateFilterStatus.Accept; }

  /** Helper method to keep the view cursor, display of locate circle, and coordinate lock overrides consistent with [[AccuSnap.isLocateEnabled]] and [[AccuSnap.isSnapEnabled]].
   * @param enableLocate Value to pass to [[AccuSnap.enableLocate]]. Tools that locate elements should always pass true to give the user feedback regarding the element at the current cursor location.
   * @param enableSnap Optional value to pass to [[AccuSnap.enableSnap]]. Tools that don't care about the element pick location should not pass true. Default is false.
   * @note User must also have snapping enabled [[AccuSnap.isSnapEnabledByUser]], otherwise [[TentativePoint]] is used to snap.
   * @param cursor Optional tool specific cursor override. Default is either cross or dynamics cursor depending on whether dynamics are currently active.
   * @param coordLockOvr Optional tool specific coordinate lock overrides. A tool that only identifies elements and does not use [[BeButtonEvent.point]] can set ToolState.coordLockOvr to CoordinateLockOverrides.ACS
   * or CoordinateLockOverrides.All, otherwise locate is affected by the input point being first projected to the ACS plane. A tool that will use [[BeButtonEvent.point]], especially those that call [[AccuSnap.enableSnap]]
   * should honor all locks and leave ToolState.coordLockOvr set to CoordinateLockOverrides.None, the default for ViewTool and PrimitiveTool.
   */
  public changeLocateState(enableLocate: boolean, enableSnap?: boolean, cursor?: string, coordLockOvr?: CoordinateLockOverrides): void {
    if (undefined !== cursor) {
      IModelApp.toolAdmin.setCursor(cursor);
      IModelApp.toolAdmin.setLocateCircleOn(enableLocate);
      IModelApp.viewManager.invalidateDecorationsAllViews();
    } else {
      IModelApp.toolAdmin.setLocateCursor(enableLocate);
    }

    IModelApp.accuSnap.enableLocate(enableLocate);
    if (undefined !== enableSnap)
      IModelApp.accuSnap.enableSnap(enableSnap);
    else
      IModelApp.accuSnap.enableSnap(false);

    if (undefined !== coordLockOvr) {
      IModelApp.toolAdmin.toolState.coordLockOvr = coordLockOvr;
    } else {
      if (enableLocate && !IModelApp.accuSnap.isSnapEnabled)
        IModelApp.toolAdmin.toolState.coordLockOvr |= CoordinateLockOverrides.ACS;
      else
        IModelApp.toolAdmin.toolState.coordLockOvr &= ~CoordinateLockOverrides.ACS;
    }
  }

  /** Helper method for tools that need to locate existing elements.
   * Initializes [[ElementLocateManager]], changes the view cursor to locate, enables display of the locate circle, and sets the appropriate coordinate lock overrides.
   * @see [[changeLocateState]]
   */
  public initLocateElements(enableLocate: boolean = true, enableSnap?: boolean, cursor?: string, coordLockOvr?: CoordinateLockOverrides): void {
    IModelApp.locateManager.initToolLocate();
    this.changeLocateState(enableLocate, enableSnap, cursor, coordLockOvr);
  }

  /** Used to supply list of properties that can be used to generate ToolSettings. If undefined is returned then no ToolSettings will be displayed
   * @beta
   */
  public supplyToolSettingsProperties(): ToolSettingsPropertyRecord[] | undefined { return undefined; }

  /** Used to receive property changes from UI. Return false if there was an error applying updatedValue.
   * @beta
   */
  public applyToolSettingPropertyChange(_updatedValue: ToolSettingsPropertySyncItem): boolean { return true; }

  /** Called by tool to synchronize the UI with property changes made by tool. This is typically used to provide user feedback during tool dynamics.
   * If the syncData contains a quantity value and if the displayValue is not defined, the displayValue will be generated in the UI layer before displaying the value.
   * @beta
   */
  public syncToolSettingsProperties(syncData: ToolSettingsPropertySyncItem[]) {
    IModelApp.toolAdmin.syncToolSettingsProperties(this.toolId, syncData);
  }
}

/** The InputCollector class can be used to implement a command for gathering input (ex. get a distance by snapping to 2 points) without affecting the state of the active primitive tool.
 * @public
 */
export abstract class InputCollector extends InteractiveTool {
  public run(): boolean {
    const toolAdmin = IModelApp.toolAdmin;
    // An input collector can only suspend a primitive tool, don't install if a viewing tool is active...
    if (undefined !== toolAdmin.viewTool || !toolAdmin.onInstallTool(this))
      return false;

    toolAdmin.startInputCollector(this);
    toolAdmin.onPostInstallTool(this);
    return true;
  }

  public exitTool(): void { IModelApp.toolAdmin.exitInputCollector(); }
  public async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled> { this.exitTool(); return EventHandled.Yes; }
}

/** The ToolRegistry holds a mapping between toolIds and their corresponding Tool class. This provides the mechanism to
 * find Tools by their toolId, and also a way to iterate over the set of Tools available.
 * @public
 */
export class ToolRegistry {
  public readonly tools = new Map<string, ToolType>();
  private _keyinList?: ToolList;

  /**
   * Un-register a previously registered Tool class.
   * @param toolId the toolId of a previously registered tool to unRegister.
   */
  public unRegister(toolId: string) { this.tools.delete(toolId); this._keyinList = undefined; }

  /**
   * Register a Tool class. This establishes a connection between the toolId of the class and the class itself.
   * @param toolClass the subclass of Tool to register.
   * @param namespace the namespace for the localized strings for this tool. If undefined, use namespace from superclass.
   */
  public register(toolClass: ToolType, namespace?: I18NNamespace) {
    if (namespace) // namespace is optional because it can come from superclass
      toolClass.namespace = namespace;

    if (toolClass.toolId.length === 0)
      return; // must be an abstract class, ignore it

    if (!toolClass.namespace)
      throw new IModelError(-1, "Tools must have a namespace");

    this.tools.set(toolClass.toolId, toolClass);
    this._keyinList = undefined;  // throw away the current keyinList so we'll produce a new one next time we're asked.
  }

  /**
   * Register all the Tool classes found in a module.
   * @param modelObj the module to search for subclasses of Tool.
   */
  public registerModule(moduleObj: any, namespace?: I18NNamespace) {
    for (const thisMember in moduleObj) {
      if (!thisMember)
        continue;

      const thisTool = moduleObj[thisMember];
      if (thisTool.prototype instanceof Tool) {
        this.register(thisTool, namespace);
      }
    }
  }

  /** Look up a tool by toolId */
  public find(toolId: string): ToolType | undefined { return this.tools.get(toolId); }

  /**
   * Look up a tool by toolId and, if found, create an instance with the supplied arguments.
   * @param toolId the toolId of the tool
   * @param args arguments to pass to the constructor.
   * @returns an instance of the registered Tool class, or undefined if toolId is not registered.
   */
  public create(toolId: string, ...args: any[]): Tool | undefined {
    const toolClass = this.find(toolId);
    return toolClass ? new toolClass(...args) : undefined;
  }

  /**
   * Look up a tool by toolId and, if found, create an instance with the supplied arguments and run it.
   * @param toolId toolId of the immediate tool
   * @param args arguments to pass to the constructor, and to run.
   * @return true if the tool was found and successfully run.
   */
  public run(toolId: string, ...args: any[]): boolean {
    const tool = this.create(toolId, ...args);
    return tool !== undefined && tool.run(...args);
  }

  /** Get a list of Tools currently registered, excluding hidden tools */
  public getToolList(): ToolList {
    if (this._keyinList === undefined) {
      this._keyinList = [];
      this.tools.forEach((thisTool) => { if (!thisTool.hidden) this._keyinList!.push(thisTool); });
    }
    return this._keyinList;
  }

  /**
   * Find a tool by its localized keyin using a FuzzySearch
   * @param keyin the localized keyin string of the Tool.
   * @note Make sure the i18n resources are all loaded (e.g. `await IModelApp.i81n.waitForAllRead()`) before calling this method.
   * @internal
   */
  public findPartialMatches(keyin: string): FuzzySearchResults<ToolType> {
    return new FuzzySearch<ToolType>().search(this.getToolList(), ["keyin"], keyin);
  }

  /**
   * Find a tool by its localized keyin. If found (via exact match), execute the tool with the supplied arguments.
   * @param keyin the localized keyin string of the Tool to run.
   * @param args the arguments for the tool. Note: these argument are passed to both the constructor and the tools' run method.
   * @note Make sure the i18n resources are all loaded (e.g. `await IModelApp.i81n.waitForAllRead()`) before calling this method.
   * @internal
   */
  public executeExactMatch(keyin: string, ...args: any[]): boolean {
    const foundClass = this.findExactMatch(keyin);
    return foundClass ? new foundClass(...args).run(...args) : false;
  }

  /**
   * Find a tool by its localized keyin.
   * @param keyin the localized keyin string of the Tool.
   * @returns the Tool class, if an exact match is found, otherwise returns undefined.
   * @note Make sure the i18n resources are all loaded (e.g. `await IModelApp.i81n.waitForAllRead()`) before calling this method.
   * @internal
   */
  public findExactMatch(keyin: string): ToolType | undefined { return this.getToolList().find((thisTool) => thisTool.keyin === keyin); }
}
