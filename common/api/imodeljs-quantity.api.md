## API Report File for "@bentley/imodeljs-quantity"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { BentleyError } from '@bentley/bentleyjs-core';

// @alpha
export class BadUnit implements UnitProps {
    // (undocumented)
    isValid: boolean;
    // (undocumented)
    label: string;
    // (undocumented)
    name: string;
    // (undocumented)
    unitFamily: string;
}

// @alpha
export class BasicUnit implements UnitProps {
    constructor(name: string, label: string, unitFamily: string, alternateLabels?: string[]);
    // (undocumented)
    alternateLabels?: string[];
    // (undocumented)
    isValid: boolean;
    // (undocumented)
    label: string;
    // (undocumented)
    name: string;
    // (undocumented)
    unitFamily: string;
}

// @alpha (undocumented)
export enum DecimalPrecision {
    // (undocumented)
    Eight = 8,
    // (undocumented)
    Eleven = 11,
    // (undocumented)
    Five = 5,
    // (undocumented)
    Four = 4,
    // (undocumented)
    Nine = 9,
    // (undocumented)
    One = 1,
    // (undocumented)
    Seven = 7,
    // (undocumented)
    Six = 6,
    // (undocumented)
    Ten = 10,
    // (undocumented)
    Three = 3,
    // (undocumented)
    Twelve = 12,
    // (undocumented)
    Two = 2,
    // (undocumented)
    Zero = 0
}

// @alpha
export class Format implements FormatProps {
    constructor(name: string);
    // (undocumented)
    readonly decimalSeparator: string;
    // (undocumented)
    protected _decimalSeparator: string;
    // (undocumented)
    readonly formatTraits: FormatTraits;
    // (undocumented)
    protected _formatTraits: FormatTraits;
    static formatTraitsToArray(currentFormatTrait: FormatTraits): string[];
    static formatTypeToString(type: FormatType): string;
    fromJson(unitsProvider: UnitsProvider, jsonObj: any): Promise<void>;
    hasFormatTraitSet(formatTrait: FormatTraits): boolean;
    // (undocumented)
    readonly hasUnits: boolean;
    // (undocumented)
    readonly includeZero: boolean | undefined;
    // (undocumented)
    protected _includeZero: boolean;
    // (undocumented)
    readonly minWidth: number | undefined;
    // (undocumented)
    protected _minWidth?: number;
    // (undocumented)
    readonly name: string;
    static parseDecimalPrecision(jsonObjPrecision: number): DecimalPrecision;
    static parseFormatTrait(stringToCheck: string, currentFormatTrait: number): FormatTraits;
    static parseFormatType(jsonObjType: string, formatName: string): FormatType;
    static parseFractionalPrecision(jsonObjPrecision: number, formatName: string): FractionalPrecision;
    static parsePrecision(precision: number, formatName: string, type: FormatType): DecimalPrecision | FractionalPrecision;
    static parseScientificType(scientificType: string, formatName: string): ScientificType;
    static parseShowSignOption(showSignOption: string, formatName: string): ShowSignOption;
    // (undocumented)
    readonly precision: DecimalPrecision | FractionalPrecision;
    // (undocumented)
    protected _precision: number;
    // (undocumented)
    readonly roundFactor: number;
    // (undocumented)
    protected _roundFactor: number;
    // (undocumented)
    readonly scientificType: ScientificType | undefined;
    // (undocumented)
    protected _scientificType?: ScientificType;
    // (undocumented)
    static scientificTypeToString(scientificType: ScientificType): string;
    // (undocumented)
    readonly showSignOption: ShowSignOption;
    // (undocumented)
    protected _showSignOption: ShowSignOption;
    static showSignOptionToString(showSign: ShowSignOption): string;
    // (undocumented)
    readonly spacer: string | undefined;
    // (undocumented)
    protected _spacer: string;
    // (undocumented)
    readonly stationOffsetSize: number | undefined;
    // (undocumented)
    protected _stationOffsetSize?: number;
    // (undocumented)
    readonly stationSeparator: string;
    // (undocumented)
    protected _stationSeparator: string;
    // (undocumented)
    readonly thousandSeparator: string;
    // (undocumented)
    protected _thousandSeparator: string;
    toJson(): {
        [value: string]: any;
    };
    // (undocumented)
    readonly type: FormatType;
    // (undocumented)
    protected _type: FormatType;
    // (undocumented)
    readonly units: Array<[UnitProps, string | undefined]> | undefined;
    // (undocumented)
    protected _units?: Array<[UnitProps, string | undefined]>;
    // (undocumented)
    readonly uomSeparator: string;
    // (undocumented)
    protected _uomSeparator: string;
    }

// @alpha
export interface FormatProps {
    // (undocumented)
    readonly decimalSeparator: string;
    // (undocumented)
    readonly formatTraits: FormatTraits;
    // (undocumented)
    readonly includeZero?: boolean;
    // (undocumented)
    readonly minWidth: number | undefined;
    // (undocumented)
    readonly name: string;
    // (undocumented)
    readonly precision: DecimalPrecision | FractionalPrecision;
    // (undocumented)
    readonly roundFactor: number;
    // (undocumented)
    readonly scientificType?: ScientificType;
    // (undocumented)
    readonly showSignOption: ShowSignOption;
    // (undocumented)
    readonly spacer?: string;
    // (undocumented)
    readonly stationOffsetSize?: number;
    // (undocumented)
    readonly stationSeparator?: string;
    // (undocumented)
    readonly thousandSeparator: string;
    // (undocumented)
    readonly type: FormatType;
    // (undocumented)
    readonly units?: Array<[UnitProps, string | undefined]>;
    // (undocumented)
    readonly uomSeparator: string;
}

// @alpha
export class Formatter {
    static formatQuantity(magnitude: number, spec: FormatterSpec): string;
    }

// @alpha
export class FormatterSpec {
    constructor(name: string, format: Format, conversions?: UnitConversionSpec[]);
    static create(name: string, format: Format, unitsProvider: UnitsProvider, inputUnit?: UnitProps): Promise<FormatterSpec>;
    // (undocumented)
    readonly format: Format;
    // (undocumented)
    readonly name: string;
    readonly unitConversions: UnitConversionSpec[];
}

// @alpha (undocumented)
export enum FormatTraits {
    // (undocumented)
    ApplyRounding = 16,
    // (undocumented)
    ExponentOnlyNegative = 512,
    // (undocumented)
    FractionDash = 32,
    // (undocumented)
    KeepDecimalPoint = 8,
    // (undocumented)
    KeepSingleZero = 2,
    // (undocumented)
    PrependUnitLabel = 128,
    // (undocumented)
    ShowUnitLabel = 64,
    // (undocumented)
    TrailZeroes = 1,
    // (undocumented)
    Use1000Separator = 256,
    // (undocumented)
    ZeroEmpty = 4
}

// @alpha (undocumented)
export enum FormatType {
    // (undocumented)
    Decimal = 0,
    // (undocumented)
    Fractional = 1,
    // (undocumented)
    Scientific = 2,
    // (undocumented)
    Station = 3
}

// @alpha (undocumented)
export enum FractionalPrecision {
    // (undocumented)
    Eight = 8,
    // (undocumented)
    Four = 4,
    // (undocumented)
    One = 1,
    // (undocumented)
    OneHundredTwentyEight = 128,
    // (undocumented)
    Sixteen = 16,
    // (undocumented)
    SixtyFour = 64,
    // (undocumented)
    ThirtyTwo = 32,
    // (undocumented)
    Two = 2,
    // (undocumented)
    TwoHundredFiftySix = 256
}

// @alpha
export class Parser {
    static createUnitConversionSpecs(unitsProvider: UnitsProvider, outUnitName: string, potentialParseUnits: PotentialParseUnit[]): Promise<UnitConversionSpec[]>;
    static createUnitConversionSpecsForUnit(unitsProvider: UnitsProvider, outUnit: UnitProps): Promise<UnitConversionSpec[]>;
    static parseIntoQuantity(inString: string, format: Format, unitsProvider: UnitsProvider): Promise<QuantityProps>;
    static parseIntoQuantityValue(inString: string, format: Format, unitsConversions: UnitConversionSpec[]): ParseResult;
    static parseQuantitySpecification(quantitySpecification: string, format: Format): ParseToken[];
    static parseQuantityString(inString: string, parserSpec: ParserSpec): ParseResult;
    }

// @alpha
export interface ParseResult {
    // (undocumented)
    status: QuantityStatus;
    // (undocumented)
    value?: number | undefined;
}

// @alpha
export class ParserSpec {
    constructor(outUnit: UnitProps, format: Format, conversions: UnitConversionSpec[]);
    static create(format: Format, unitsProvider: UnitsProvider, outUnit: UnitProps): Promise<ParserSpec>;
    // (undocumented)
    readonly format: Format;
    // (undocumented)
    readonly outUnit: UnitProps;
    readonly unitConversions: UnitConversionSpec[];
}

// @alpha
export interface PotentialParseUnit {
    // (undocumented)
    altLabels?: string[];
    // (undocumented)
    unitName: string;
}

// @alpha
export class Quantity implements QuantityProps {
    constructor(unit?: UnitProps, magnitude?: number);
    convertTo(toUnit: UnitProps, conversion: UnitConversion): Quantity | undefined;
    // (undocumented)
    readonly isValid: boolean;
    // (undocumented)
    protected _isValid: boolean;
    // (undocumented)
    readonly magnitude: number;
    // (undocumented)
    protected _magnitude: number;
    // (undocumented)
    readonly unit: UnitProps;
    // (undocumented)
    protected _unit: UnitProps;
}

// @internal
export class QuantityConstants {
    // (undocumented)
    static readonly CHAR_COMMA = 44;
    // (undocumented)
    static readonly CHAR_DIGIT_NINE = 57;
    // (undocumented)
    static readonly CHAR_DIGIT_ZERO = 48;
    // (undocumented)
    static readonly CHAR_DIVISION_SLASH = 8725;
    // (undocumented)
    static readonly CHAR_FRACTION_SLASH = 8260;
    // (undocumented)
    static readonly CHAR_LOWER_E = 101;
    // (undocumented)
    static readonly CHAR_MINUS = 45;
    // (undocumented)
    static readonly CHAR_NUMBER = 35;
    // (undocumented)
    static readonly CHAR_ONE_HALF = 189;
    // (undocumented)
    static readonly CHAR_ONE_QUARTER = 188;
    // (undocumented)
    static readonly CHAR_PERIOD = 46;
    // (undocumented)
    static readonly CHAR_PLUS = 43;
    // (undocumented)
    static readonly CHAR_SLASH = 47;
    // (undocumented)
    static readonly CHAR_SPACE = 32;
    // (undocumented)
    static readonly CHAR_THREE_QUARTER = 190;
    // (undocumented)
    static readonly CHAR_UPPER_E = 69;
    static readonly LocaleSpecificDecimalSeparator: string;
    static readonly LocaleSpecificThousandSeparator: string;
}

// @alpha
export class QuantityError extends BentleyError {
    constructor(errorNumber: number, message?: string);
    // (undocumented)
    readonly errorNumber: number;
}

// @alpha
export interface QuantityProps {
    // (undocumented)
    readonly isValid: boolean;
    // (undocumented)
    readonly magnitude: number;
    // (undocumented)
    readonly unit: UnitProps;
}

// @alpha
export enum QuantityStatus {
    // (undocumented)
    InvalidCompositeFormat = 35041,
    // (undocumented)
    InvalidJson = 35040,
    // (undocumented)
    NoValueOrUnitFoundInString = 35043,
    // (undocumented)
    QUANTITY_ERROR_BASE = 35039,
    // (undocumented)
    Success = 0,
    // (undocumented)
    UnableToConvertParseTokensToQuantity = 35046,
    // (undocumented)
    UnableToGenerateParseTokens = 35042,
    // (undocumented)
    UnitLabelSuppliedButNotMatched = 35044,
    // (undocumented)
    UnknownUnit = 35045
}

// @alpha (undocumented)
export enum ScientificType {
    // (undocumented)
    Normalized = 0,
    // (undocumented)
    ZeroNormalized = 1
}

// @alpha (undocumented)
export enum ShowSignOption {
    // (undocumented)
    NegativeParentheses = 3,
    // (undocumented)
    NoSign = 0,
    // (undocumented)
    OnlyNegative = 1,
    // (undocumented)
    SignAlways = 2
}

// @alpha
export interface UnitConversion {
    // (undocumented)
    factor: number;
    // (undocumented)
    offset: number;
}

// @alpha
export interface UnitConversionSpec {
    conversion: UnitConversion;
    label: string;
    name: string;
    parseLabels?: string[];
}

// @alpha
export interface UnitProps {
    readonly alternateLabels?: string[];
    readonly isValid: boolean;
    readonly label: string;
    readonly name: string;
    readonly unitFamily: string;
}

// @alpha
export interface UnitsProvider {
    // (undocumented)
    findUnit(unitLabel: string, unitFamily?: string): Promise<UnitProps>;
    // (undocumented)
    findUnitByName(unitName: string): Promise<UnitProps>;
    // (undocumented)
    getConversion(fromUnit: UnitProps, toUnit: UnitProps): Promise<UnitConversion>;
    // (undocumented)
    getUnitsByFamily(unitFamily: string): Promise<UnitProps[]>;
}


// (No @packageDocumentation comment for this package)

```
