/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { mount } from "enzyme";
import { expect } from "chai";
import { Provider } from "react-redux";
import * as sinon from "sinon";

import TestUtils from "../TestUtils";
import { SnapMode } from "@bentley/imodeljs-frontend";
import { FooterPopup } from "@bentley/ui-ninezone";

import {
  SnapModeField,
  StatusBarWidgetControl,
  StatusBar,
  WidgetState,
  ConfigurableCreateInfo,
  WidgetDef,
  ConfigurableUiControlType,
  UiFramework,
  StatusBarWidgetControlArgs,
} from "../../ui-framework";

describe("SnapModeField", () => {

  class AppStatusBarWidgetControl extends StatusBarWidgetControl {
    constructor(info: ConfigurableCreateInfo, options: any) {
      super(info, options);
    }

    public getReactNode({ isInFooterMode, onOpenWidget, openWidget }: StatusBarWidgetControlArgs): React.ReactNode {
      return (
        <>
          <SnapModeField isInFooterMode={isInFooterMode} onOpenWidget={onOpenWidget} openWidget={openWidget} />
        </>
      );
    }
  }

  let widgetControl: StatusBarWidgetControl | undefined;

  before(async () => {
    await TestUtils.initializeUiFramework();

    const statusBarWidgetDef = new WidgetDef({
      classId: AppStatusBarWidgetControl,
      defaultState: WidgetState.Open,
      isFreeform: false,
      isStatusBar: true,
    });
    widgetControl = statusBarWidgetDef.getWidgetControl(ConfigurableUiControlType.StatusBarWidget) as StatusBarWidgetControl;
  });

  it("Status Bar with SnapModes Field should mount", () => {
    const modes = [SnapMode.NearestKeypoint as number, SnapMode.Intersection as number, SnapMode.Center as number,
    SnapMode.Nearest as number, SnapMode.Origin as number, SnapMode.MidPoint as number, SnapMode.Bisector as number];

    const icons = ["icon-snaps", "icon-snaps-intersection", "icon-snaps-center", "icon-snaps-nearest",
      "icon-snaps-origin", "icon-snaps-midpoint", "icon-snaps-bisector"];

    const wrapper = mount(<Provider store={TestUtils.store}>
      <StatusBar widgetControl={widgetControl} isInFooterMode={true} />
    </Provider>);

    // Simulate a click to open the pop-up dialog
    wrapper.find(".nz-footer-snapMode-indicator .nz-indicator").simulate("click"); // Opens it
    wrapper.update();

    for (let i = 0; i < 7; i++) {
      // Simulate selecting a snap mode
      const snaps = wrapper.find(".nz-footer-snapMode-snap");
      expect(snaps.length).to.eq(7);
      snaps.at(i).simulate("click");
      wrapper.update();

      // ensure the snap mode selected sets the state of the store.
      const snapMode = UiFramework.frameworkState ? UiFramework.frameworkState.configurableUiState.snapMode : SnapMode.NearestKeypoint;
      expect(snapMode).to.eq(modes[i]);

      // the indicator field should contain the selected snap icon.
      const itemId = ".nz-footer-snapMode-snap ." + icons[i];
      expect(wrapper.find(itemId).length).to.eq(1);
    }

    wrapper.find(".nz-footer-snapMode-indicator .nz-indicator").simulate("click"); // Closes popup
    wrapper.update();

    wrapper.unmount();
  });

  it("Validate multiple snaps mode", () => {

    // force to use multi-snap
    UiFramework.setAccudrawSnapMode(SnapMode.Intersection | SnapMode.NearestKeypoint);
    const snapMode = UiFramework.getAccudrawSnapMode();
    expect(snapMode).to.be.equal(SnapMode.Intersection | SnapMode.NearestKeypoint);
    const wrapper = mount(<Provider store={TestUtils.store}>
      <StatusBar widgetControl={widgetControl} isInFooterMode={true} />
    </Provider>);

    // the indicator field should contain the multi-snap icon.
    const itemId = ".icon-snaps-multione";
    expect(wrapper.find(itemId).length).to.eq(1);

    wrapper.unmount();
  });

  it("should close on outside click", () => {
    const wrapper = mount(<Provider store={TestUtils.store}>
      <StatusBar widgetControl={widgetControl} isInFooterMode />
    </Provider>);
    const statusBar = wrapper.find(StatusBar);
    const footerPopup = wrapper.find(FooterPopup);

    const statusBarInstance = statusBar.instance() as StatusBar;
    statusBarInstance.setState(() => ({ openWidget: "test-widget" }));

    const outsideClick = new MouseEvent("");
    sinon.stub(outsideClick, "target").get(() => document.createElement("div"));
    footerPopup.prop("onOutsideClick")!(outsideClick);

    expect(statusBarInstance.state.openWidget).null;
  });

  it("should not close on outside click", () => {
    const wrapper = mount<Provider>(<Provider store={TestUtils.store}>
      <StatusBar widgetControl={widgetControl} isInFooterMode />
    </Provider>);
    const statusBar = wrapper.find(StatusBar);
    const footerPopup = wrapper.find(FooterPopup);

    const statusBarInstance = statusBar.instance() as StatusBar;
    statusBarInstance.setState(() => ({ openWidget: "test-widget" }));
    const outsideClick = new MouseEvent("");
    footerPopup.prop("onOutsideClick")!(outsideClick);

    expect(statusBarInstance.state.openWidget).eq("test-widget");
  });

});
