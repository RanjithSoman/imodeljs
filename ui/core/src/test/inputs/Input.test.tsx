/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { mount, shallow } from "enzyme";
import * as React from "react";
import { Input } from "../../ui-core";

describe("<Input />", () => {
  it("should render", () => {
    mount(<Input />);
  });

  it("renders correctly", () => {
    shallow(<Input />).should.matchSnapshot();
  });
});
