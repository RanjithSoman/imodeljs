# Change Log - @bentley/webpack-tools

This log was last generated on Mon, 03 Jun 2019 18:09:39 GMT and should not be manually modified.

## 1.0.0
Mon, 03 Jun 2019 18:09:39 GMT

### Updates

- Use fast-sass-loader instead of sass-loader
- Fix copying of css files to webresource in prod build.
- Update to css-loader 2.1.1
- Fixed problems with not finding package.json for indirect dependencies, webpack error obscuration.
- Fix webpack to put the .css files required into the version string of index.html
- Webpack of plugins should not include main in versionsRequired
- For production builds, create separate css files. Use fork of fast-css-loader until outputStyle issue addressed..
- Use optimize-css-assets-webpack-plugin instead of fork of fast-sass-loader.

## 0.191.0
Mon, 13 May 2019 15:52:05 GMT

### Updates

- Added a way for buildIModelJsModule to combine multiple json5 files into an output config.json file.
- Fix analyzeWebpackStats to account for npm node_module location difference
- Fix case of IModelJsLoader
- Fix packageSizesProd.bat script
- add imodeljs-markup as a module
- Backends must be started up with a larger limit on http headers. 
- Change version compare for plugin to >=
- Require React & React-dom 16.8
- Remove the copyExternalModules script as it is unnecessary by the buildiModelJsModule script.
- Update the version of nyc to 14.0.0
- Changes to build process to put all JavaScript files in version-specific subdirectories to avoid browser caching problems when deploying new versions.

## 0.190.0
Thu, 14 Mar 2019 14:26:49 GMT

### Updates

- changes path to config-loader from nested to sibling dependency in order to function in non-symlinked repos that use rush/pnpm
- First checks for nested dependency. Falls back to sibling
- Change to fix iModelJs version string was overly broad.
- fix issue for ios
- Massage the version required stored in Plugins in the case of pre-release versions.
- Cleaned up index.scss for variables & mixins in ui-core and added classes.scss that generates CSS

## 0.189.0
Wed, 06 Mar 2019 15:41:22 GMT

### Updates

- Fix BuildIModelJsModule for packages external to monorepository
- Added buildIModelJsBuild script to sequence frontend module builds
- Uglify Options changed to fix regex known problem.
- Change default mode to copy rather than symlink files.
- Webworker module type added
- Fix for CopyExternalModules for indirect iModel.js dependent modules.
- Provide a way to copy rather than symlink sourceResources
- Convert IndexedPolyface params from array-of-points to GrowableXYArray.
- Changes to define BUILD_SEMVER in modules, define SEMVERs required for iModelJs system modules for Plugins.
- Rewrite of CopyExternalModules
- upgrade to TypeScript 3.2.2

## 0.188.0
Wed, 16 Jan 2019 16:36:09 GMT

*Version update only*

## 0.187.0
Tue, 15 Jan 2019 15:18:59 GMT

*Version update only*

## 0.186.0
Mon, 14 Jan 2019 23:09:10 GMT

*Version update only*

## 0.185.0
Fri, 11 Jan 2019 18:29:00 GMT

*Version update only*

## 0.184.0
Thu, 10 Jan 2019 22:46:17 GMT

*Version update only*

## 0.183.0
Mon, 07 Jan 2019 21:49:21 GMT

*Version update only*

## 0.182.0
Mon, 07 Jan 2019 13:31:35 GMT

*Version update only*

## 0.181.0
Fri, 04 Jan 2019 13:02:40 GMT

*Version update only*

## 0.180.0
Wed, 02 Jan 2019 15:18:23 GMT

*Version update only*

## 0.179.0
Wed, 19 Dec 2018 18:26:14 GMT

### Updates

- Added mobile config

## 0.178.0
Thu, 13 Dec 2018 22:06:10 GMT

*Version update only*

## 0.177.0
Wed, 12 Dec 2018 17:21:32 GMT

*Version update only*

## 0.176.0
Mon, 10 Dec 2018 21:19:45 GMT

### Updates

- Enhancement to copyExternalModules

## 0.175.0
Mon, 10 Dec 2018 17:08:55 GMT

*Version update only*

## 0.174.0
Mon, 10 Dec 2018 13:24:09 GMT

### Updates

- Fix copyExternalModules for use by package external to rush repository

## 0.173.0
Thu, 06 Dec 2018 22:03:29 GMT

### Updates

- Added command to build backend/frontend for ios

## 0.172.0
Tue, 04 Dec 2018 17:24:39 GMT

### Updates

- Added the modules subdirectory, containing configuration file needed to webpack our packages as separate modules.

## 0.171.0
Mon, 03 Dec 2018 18:52:58 GMT

*Version update only*

## 0.170.0
Mon, 26 Nov 2018 19:38:42 GMT

*Version update only*

## 0.169.0
Tue, 20 Nov 2018 16:17:15 GMT

*Version update only*

## 0.168.0
Sat, 17 Nov 2018 14:20:11 GMT

*Version update only*

## 0.167.0
Fri, 16 Nov 2018 21:45:44 GMT

*Version update only*

## 0.166.0
Mon, 12 Nov 2018 16:42:10 GMT

*Version update only*

## 0.165.0
Mon, 12 Nov 2018 15:47:00 GMT

*Version update only*

## 0.164.0
Thu, 08 Nov 2018 17:59:21 GMT

### Updates

- Deprecated dev-cors-proxy-server and use of it. 
- Updated to TypeScript 3.1

## 0.163.0
Wed, 31 Oct 2018 20:55:37 GMT

*Version update only*

## 0.162.0
Wed, 24 Oct 2018 19:20:07 GMT

*Version update only*

## 0.161.0
Fri, 19 Oct 2018 13:04:14 GMT

*Version update only*

## 0.160.0
Wed, 17 Oct 2018 18:18:38 GMT

*Version update only*

## 0.159.0
Tue, 16 Oct 2018 14:09:09 GMT

### Updates

- Fix a issue where web-tool fail to skip lookup for config dir

## 0.158.0
Mon, 15 Oct 2018 19:36:09 GMT

### Updates

- change noConfigLoader to configLoader default false

## 0.157.0
Sun, 14 Oct 2018 17:20:06 GMT

*Version update only*

## 0.156.0
Fri, 12 Oct 2018 23:00:10 GMT

### Updates

- Initial release

