/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module UnifiedSelection */

import { Id64Arg } from "@bentley/bentleyjs-core";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { KeySet, SelectionScope, RpcRequestsHandler } from "@bentley/presentation-common";

/**
 * Properties for creating [[SelectionScopesManager]].
 * @public
 */
export interface SelectionScopesManagerProps {
  /** RPC handler to use for requesting selection scopes */
  rpcRequestsHandler: RpcRequestsHandler;

  /** Provider of active locale to use for localizing scopes */
  localeProvider?: () => string | undefined;
}

/**
 * A manager that knows available [selection scopes]($docs/learning/unified-selection/Terminology#selection-scope)
 * and can compute logical selection based on element IDs and selection scope.
 *
 * @public
 */
export class SelectionScopesManager {

  private _rpcRequestsHandler: RpcRequestsHandler;
  private _getLocale: () => string | undefined;
  private _activeScope: SelectionScope | string | undefined;

  public constructor(props: SelectionScopesManagerProps) {
    this._rpcRequestsHandler = props.rpcRequestsHandler;
    this._getLocale = props.localeProvider ? props.localeProvider : (() => undefined);
  }

  /** Get active locale */
  public get activeLocale() { return this._getLocale(); }

  /** Get active selection scope or its id */
  public get activeScope() { return this._activeScope; }
  /** Set active selection scope or its id */
  public set activeScope(scope: SelectionScope | string | undefined) { this._activeScope = scope; }

  /**
   * Get available selection scopes.
   * @param imodel The iModel to get selection scopes for
   * @param locale Optional locale to use when localizing scopes' label and description
   */
  public async getSelectionScopes(imodel: IModelConnection, locale?: string): Promise<SelectionScope[]> {
    if (!locale)
      locale = this._getLocale();
    return this._rpcRequestsHandler.getSelectionScopes({ imodel: imodel.iModelToken, locale });
  }

  /**
   * Computes keys that need to be added to logical selection based on provided selection scope.
   * @param ids Element IDs to compute selection for
   * @param scope Selection scope to apply
   */
  public async computeSelection(imodel: IModelConnection, ids: Id64Arg, scope: SelectionScope | string): Promise<KeySet> {
    // get scope id
    const scopeId = (typeof scope === "string") ? scope : scope.id;

    // convert ids input to array
    if (typeof ids === "string")
      ids = [ids];
    else if (ids instanceof Set)
      ids = [...ids];

    // compute selection in batches to avoid HTTP 413
    const keys = new KeySet();
    const batchSize = 10000;
    const batchesCount = Math.ceil(ids.length / batchSize);
    const batchKeyPromises = [];
    for (let batchIndex = 0; batchIndex < batchesCount; ++batchIndex) {
      const batchStart = batchSize * batchIndex;
      const batchEnd = (batchStart + batchSize > ids.length) ? ids.length : (batchStart + batchSize);
      const batchIds = (0 === batchIndex && ids.length <= batchEnd) ? ids : ids.slice(batchStart, batchEnd);
      batchKeyPromises.push(this._rpcRequestsHandler.computeSelection({ imodel: imodel.iModelToken }, batchIds, scopeId));
    }
    const batchKeys = (await Promise.all(batchKeyPromises)).map(KeySet.fromJSON);
    batchKeys.forEach((bk) => keys.add(bk));
    return keys;
  }
}
