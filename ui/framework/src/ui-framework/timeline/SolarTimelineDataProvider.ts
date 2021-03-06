/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Timeline */

import {
  BaseSolarDataProvider,
} from "@bentley/ui-components";

import { ScreenViewport, DisplayStyle3dState, ViewState } from "@bentley/imodeljs-frontend";
import { Cartographic, ColorDef, ColorByName } from "@bentley/imodeljs-common";

// the interface and class are in alpha state - it may change after usability testing - test coverage not complete
/* istanbul ignore file */

/** Default Solar Data Provider interface for getting and setting solar position from iModels view definitions.
 * @alpha
 */
export class SolarTimelineDataProvider extends BaseSolarDataProvider {
  protected _viewState: ViewState;

  /** constructor that takes an optional viewport and optional position on globe that is used if the imodel is not "GeoLocated"  */
  constructor(viewState: ViewState, viewport?: ScreenViewport, longitude?: number, latitude?: number) {
    super(viewport, longitude, latitude);
    this._viewState = viewState;

    if (viewState.is3d()) {
      const displayStyle = viewState.displayStyle as DisplayStyle3dState;
      if (displayStyle)
        this.supportsTimelineAnimation = true;
      this._cartographicCenter = this.getCartographicCenter(viewState.iModel);
    } else {
      this._cartographicCenter = Cartographic.fromDegrees(this.longitude, this.latitude, 0.0);
    }
  }

  public get shouldShowTimeline() {
    if (this._viewport) {
      const displayStyle = this._viewport.view.displayStyle as DisplayStyle3dState;
      if (displayStyle && displayStyle.viewFlags.shadows) {
        return true;
      }
    }
    return false;
  }

  public onTimeChanged = (time: Date) => {
    this.timeOfDay = time;
    // istanbul ignore else
    if (this._viewport) {
      const displayStyle = this._viewport.view.displayStyle as DisplayStyle3dState;
      if (displayStyle) {
        displayStyle.setSunTime(time.getTime());
        this._viewport.sync.invalidateScene();
      }
    }
  }

  public get shadowColor(): ColorDef {
    if (this._viewport) {
      const displayStyle = this._viewport.view.displayStyle as DisplayStyle3dState;
      if (displayStyle) {
        return displayStyle.settings.solarShadowsSettings.color;
      }
    }
    return new ColorDef(ColorByName.gray);
  }

  public set shadowColor(color: ColorDef) {
    if (this._viewport) {
      const displayStyle = this._viewport.view.displayStyle as DisplayStyle3dState;
      if (displayStyle && color !== displayStyle.settings.solarShadowsSettings.color) {
        displayStyle.settings.solarShadowsSettings.color = color;
        this._viewport.sync.invalidateScene();
      }
    }
  }
}
