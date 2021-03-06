/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Widget */

import { WidgetProps } from "./Widget";
import { WidgetDef } from "./WidgetDef";
import { ToolWidgetDef } from "./ToolWidget";
import { NavigationWidgetDef } from "./NavigationWidget";

/** Factory class for creating an appropriate Widget definition based on Widget properties.
 * @internal
 */
export class WidgetDefFactory {
  /** Creates an appropriate [[WidgetDef]] based on the given [[WidgetProps]].
   * @param widgetProps  The properties used to create the WidgetDef
   * @returns  The created WidgetDef
   */
  public static create(widgetProps: WidgetProps): WidgetDef {
    if ("appButton" in widgetProps) {
      return new ToolWidgetDef(widgetProps);
    } else if ("navigationAidId" in widgetProps) {
      return new NavigationWidgetDef(widgetProps);
    }

    return new WidgetDef(widgetProps);
  }
}
