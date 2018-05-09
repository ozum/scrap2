<!-- DO NOT EDIT README.md (It will be overridden by README.hbs) -->

# @fortibase/scrap2

experiment

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

* [Description](#description)
* [Synopsis](#synopsis)
* [Details](#details)
* [API](#api)
  * [Classes](#classes)
  * [DataObject](#dataobject)
    * [new DataObject([data], [options])](#new-dataobjectdata-options)
    * [dataObject.isChanged : <code>boolean</code>](#dataobjectischanged--codebooleancode)
    * [dataObject.data : <code>Data</code>](#dataobjectdata--codedatacode)
    * [dataObject.original : <code>Data</code>](#dataobjectoriginal--codedatacode)
    * [dataObject.snapshot : <code>Data</code>](#dataobjectsnapshot--codedatacode)
    * [dataObject.has(props, [t], [f]) ⇒ <code>\*</code>](#dataobjecthasprops-t-f-%E2%87%92-code%5Ccode)
    * [dataObject.hasSubProp(prop, subProps, [t], [f]) ⇒ <code>\*</code>](#dataobjecthassubpropprop-subprops-t-f-%E2%87%92-code%5Ccode)
    * [dataObject.get(path) ⇒ <code>\*</code>](#dataobjectgetpath-%E2%87%92-code%5Ccode)
    * [dataObject.set(path, value) ⇒ <code>this</code>](#dataobjectsetpath-value-%E2%87%92-codethiscode)
    * [dataObject.setObject(data, [options]) ⇒ <code>this</code>](#dataobjectsetobjectdata-options-%E2%87%92-codethiscode)
    * [dataObject.remove(path, [options]) ⇒ <code>this</code>](#dataobjectremovepath-options-%E2%87%92-codethiscode)
    * [dataObject.reset() ⇒ <code>Array.&lt;Operation&gt;</code>](#dataobjectreset-%E2%87%92-codearrayltoperationgtcode)
  * [ResettableFile](#resettablefile)
    * [new ResettableFile(registryFile, [options])](#new-resettablefileregistryfile-options)
    * [resettableFile.root : <code>string</code>](#resettablefileroot--codestringcode)
    * [resettableFile.sourceRoot : <code>string</code>](#resettablefilesourceroot--codestringcode)
    * [resettableFile.track : <code>boolean</code>](#resettablefiletrack--codebooleancode)
    * [resettableFile.logger : <code>BasicLogger</code>](#resettablefilelogger--codebasicloggercode)
    * [resettableFile.logLevel : <code>string</code>](#resettablefileloglevel--codestringcode)
    * [resettableFile.fromRoot(...part) ⇒ <code>string</code>](#resettablefilefromrootpart-%E2%87%92-codestringcode)
    * [resettableFile.fromSourceRoot(...part) ⇒ <code>string</code>](#resettablefilefromsourcerootpart-%E2%87%92-codestringcode)
    * [resettableFile.isDataFile(projectFile) ⇒ <code>boolean</code>](#resettablefileisdatafileprojectfile-%E2%87%92-codebooleancode)
    * [resettableFile.hasFileSync(projectFiles, [t], [f]) ⇒ <code>\*</code>](#resettablefilehasfilesyncprojectfiles-t-f-%E2%87%92-code%5Ccode)
    * [resettableFile.saveSync() ⇒ <code>void</code>](#resettablefilesavesync-%E2%87%92-codevoidcode)
    * [resettableFile.resetSync() ⇒ <code>void</code>](#resettablefileresetsync-%E2%87%92-codevoidcode)
    * [resettableFile.resetFileSync(projectFile) ⇒ <code>void</code>](#resettablefileresetfilesyncprojectfile-%E2%87%92-codevoidcode)
    * [resettableFile.getFileDetailsSync(projectFile, options) ⇒ <code>FileDetail</code>](#resettablefilegetfiledetailssyncprojectfile-options-%E2%87%92-codefiledetailcode)
    * [resettableFile.getFileHashSync(projectFile) ⇒ <code>string</code>](#resettablefilegetfilehashsyncprojectfile-%E2%87%92-codestringcode)
    * [resettableFile.getDataObjectSync(projectFile, [options]) ⇒ <code>DataObject</code>](#resettablefilegetdataobjectsyncprojectfile-options-%E2%87%92-codedataobjectcode)
    * [resettableFile.createSymLinkSync(targetFile, projectFile, [options]) ⇒ <code>void</code>](#resettablefilecreatesymlinksynctargetfile-projectfile-options-%E2%87%92-codevoidcode)
    * [resettableFile.readFileSync(projectFile, [options]) ⇒ <code>\*</code>](#resettablefilereadfilesyncprojectfile-options-%E2%87%92-code%5Ccode)
    * [resettableFile.readFileDetailedSync(projectFile, [options]) ⇒ <code>Object</code>](#resettablefilereadfiledetailedsyncprojectfile-options-%E2%87%92-codeobjectcode)
    * [resettableFile.writeFileSync(projectFile, data, [options]) ⇒ <code>void</code>](#resettablefilewritefilesyncprojectfile-data-options-%E2%87%92-codevoidcode)
    * [resettableFile.deleteFileSync(projectFile, [options]) ⇒ <code>void</code>](#resettablefiledeletefilesyncprojectfile-options-%E2%87%92-codevoidcode)
    * [resettableFile.copyFileSync(sourceFile, projectFile, [options]) ⇒ <code>void</code>](#resettablefilecopyfilesyncsourcefile-projectfile-options-%E2%87%92-codevoidcode)
    * [resettableFile.createDirSync(projectDir, [options]) ⇒ <code>void</code>](#resettablefilecreatedirsyncprojectdir-options-%E2%87%92-codevoidcode)
    * [resettableFile.deleteDirSync(projectDir, [options]) ⇒ <code>void</code>](#resettablefiledeletedirsyncprojectdir-options-%E2%87%92-codevoidcode)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Description

# Synopsis

```js
```

# Details

# API

## Classes

<dl>
<dt><a href="#DataObject">DataObject</a></dt>
<dd><p>This class is used for modifications of the given object.</p></dd>
<dt><a href="#ResettableFile">ResettableFile</a></dt>
<dd><p>Provides utility class and methods for boilerplate projects to create/copy/remove files, directories and data files (json/yaml).
Created files, directories and data files are tracked and recorded to a json file, and modifications done by this library can be undone
by <code>reset()</code> method.</p></dd>
</dl>

<a name="DataObject"></a>

## DataObject

<p>This class is used for modifications of the given object.</p>

**Kind**: global class

* [DataObject](#DataObject)
  * [new DataObject([data], [options])](#new_DataObject_new)
  * [.isChanged](#DataObject+isChanged) : <code>boolean</code>
  * [.data](#DataObject+data) : <code>Data</code>
  * [.original](#DataObject+original) : <code>Data</code>
  * [.snapshot](#DataObject+snapshot) : <code>Data</code>
  * [.has(props, [t], [f])](#DataObject+has) ⇒ <code>\*</code>
  * [.hasSubProp(prop, subProps, [t], [f])](#DataObject+hasSubProp) ⇒ <code>\*</code>
  * [.get(path)](#DataObject+get) ⇒ <code>\*</code>
  * [.set(path, value)](#DataObject+set) ⇒ <code>this</code>
  * [.setObject(data, [options])](#DataObject+setObject) ⇒ <code>this</code>
  * [.remove(path, [options])](#DataObject+remove) ⇒ <code>this</code>
  * [.reset()](#DataObject+reset) ⇒ <code>Array.&lt;Operation&gt;</code>

<a name="new_DataObject_new"></a>

### new DataObject([data], [options])

<p>Creates an instance of DataObject.</p>

| Param                | Type                                 | Default         | Description                                                                                                                                                  |
| -------------------- | ------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [data]               | <code>Object</code>                  | <code>{}</code> | <p>Data to be modified.</p>                                                                                                                                  |
| [options]            | <code>Object</code>                  |                 | <p>Options</p>                                                                                                                                               |
| [options.track]      | <code>boolean</code>                 |                 | <p>Whether to track changes.</p>                                                                                                                             |
| [options.sortKeys]   | <code>Array.&lt;string&gt;</code>    |                 | <p>List of keys which their values shoud be sorted. Key names be paths like &quot;scripts.test&quot;</p>                                                     |
| [options.name]       | <code>string</code>                  |                 | <p>Path of the name to be used in logs.</p>                                                                                                                  |
| [options.format]     | <code>Format</code>                  |                 | <p>Data format used for parsing and serializing data.</p>                                                                                                    |
| [options.operations] | <code>Array.&lt;Operation&gt;</code> |                 | <p>Operations to reset data to its original state.</p>                                                                                                       |
| [options.logger]     | <code>Logger</code>                  |                 | <p>A looger instance such as winston. Must implement <code>silky</code>, <code>verbose</code>, <code>info</code>, <code>warn</code>, <code>error</code>.</p> |

<a name="DataObject+isChanged"></a>

### dataObject.isChanged : <code>boolean</code>

<p>Whether data is changed.</p>

**Kind**: instance property of [<code>DataObject</code>](#DataObject)  
**Read only**: true  
<a name="DataObject+data"></a>

### dataObject.data : <code>Data</code>

<p>Stored data.</p>

**Kind**: instance property of [<code>DataObject</code>](#DataObject)  
**Read only**: true  
<a name="DataObject+original"></a>

### dataObject.original : <code>Data</code>

<p>Original state of the data after operations applied to reset into its original state.</p>

**Kind**: instance property of [<code>DataObject</code>](#DataObject)  
**Read only**: true  
<a name="DataObject+snapshot"></a>

### dataObject.snapshot : <code>Data</code>

<p>Data in the state given to constructor</p>

**Kind**: instance property of [<code>DataObject</code>](#DataObject)  
**Read only**: true  
<a name="DataObject+has"></a>

### dataObject.has(props, [t], [f]) ⇒ <code>\*</code>

<p>Returns one of the given values based on whether some of given property or properties exists in given object.
Property names may be given as chained such as <code>key</code> or <code>key.subkey</code>.</p>

**Kind**: instance method of [<code>DataObject</code>](#DataObject)  
**Returns**: <code>\*</code> - <ul>

<li><code>t</code> or <code>f</code> value based on existence of property.</li>
</ul>  

| Param | Type                                                   | Default            | Description                                                         |
| ----- | ------------------------------------------------------ | ------------------ | ------------------------------------------------------------------- |
| props | <code>string</code> \| <code>Array.&lt;Path&gt;</code> |                    | <p>Property or properties to look in data</p>                       |
| [t]   | <code>\*</code>                                        | <code>true</code>  | <p>Value to return if some of the properties exists in project.</p> |
| [f]   | <code>\*</code>                                        | <code>false</code> | <p>Value to return if none of the properties exists in project.</p> |

**Example**

```js
const result = project.hasProp(["scripts.build", "scripts.build:doc"], "yes", "no");
```

<a name="DataObject+hasSubProp"></a>

### dataObject.hasSubProp(prop, subProps, [t], [f]) ⇒ <code>\*</code>

<p>Returns one of the given values based on whether some of given property path or property paths exists in object's target property path.
Property names may be given as chained such as <code>key</code> or <code>key.subkey</code>.</p>

**Kind**: instance method of [<code>DataObject</code>](#DataObject)  
**Returns**: <code>\*</code> - <ul>

<li><code>t</code> or <code>f</code> value based on existence of sub property.</li>
</ul>  

| Param    | Type                                                   | Default            | Description                                              |
| -------- | ------------------------------------------------------ | ------------------ | -------------------------------------------------------- |
| prop     | <code>Path</code>                                      |                    | <p>Property or properties to look in data</p>            |
| subProps | <code>string</code> \| <code>Array.&lt;Path&gt;</code> |                    | <p>Property or properties to look in data</p>            |
| [t]      | <code>\*</code>                                        | <code>true</code>  | <p>Value to return if some of the properties exists.</p> |
| [f]      | <code>\*</code>                                        | <code>false</code> | <p>Value to return if none of the properties exists.</p> |

**Example**

```js
const result = project.hasSubProp("scripts", ["build", "build:doc"]);
const result2 = project.hasSubProp("address.home", ["street.name", "street.no"]);
```

<a name="DataObject+get"></a>

### dataObject.get(path) ⇒ <code>\*</code>

<p>Returns data in given key or path. Path may be given as chained. (i.e &quot;scripts.compile&quot;)</p>

**Kind**: instance method of [<code>DataObject</code>](#DataObject)  
**Returns**: <code>\*</code> - <ul>

<li>Data stored at given key.</li>
</ul>  

| Param | Type              | Description                  |
| ----- | ----------------- | ---------------------------- |
| path  | <code>Path</code> | <p>Path to get data from</p> |

<a name="DataObject+set"></a>

### dataObject.set(path, value) ⇒ <code>this</code>

<p>Stores given data at given key or path. Based on force option, does not change value if it is not created automatically by this library by looking registry.
Path may be given as chained. (i.e &quot;scripts.compile&quot;)</p>

**Kind**: instance method of [<code>DataObject</code>](#DataObject)  
**Returns**: <code>this</code> - <ul>

<li>Object instance.</li>
</ul>  

| Param | Type              | Description                         |
| ----- | ----------------- | ----------------------------------- |
| path  | <code>Path</code> | <p>Path to store data at.</p>       |
| value | <code>\*</code>   | <p>Value to store at given key.</p> |

<a name="DataObject+setObject"></a>

### dataObject.setObject(data, [options]) ⇒ <code>this</code>

<p>Stores each key and its value in the object. Key's may be given as chained paths such as <code>scripts.compile</code>.</p>

**Kind**: instance method of [<code>DataObject</code>](#DataObject)  
**Returns**: <code>this</code> - <ul>

<li>Object instance.</li>
</ul>  

| Param           | Type                 | Default            | Description                                                            |
| --------------- | -------------------- | ------------------ | ---------------------------------------------------------------------- |
| data            | <code>Object</code>  |                    | <p>Data to store at object.</p>                                        |
| [options]       | <code>Object</code>  |                    | <p>Options</p>                                                         |
| [options.force] | <code>boolean</code> | <code>false</code> | <p>Whether to force change even value is altered by user manually.</p> |

**Example**

```js
data.setObject({ "a.b": 1, c: 2, d: 3 });
```

<a name="DataObject+remove"></a>

### dataObject.remove(path, [options]) ⇒ <code>this</code>

<p>Removes given path or paths from object . Based on force option, does not remove value if it is not created automatically by this library by looking registry.
Path may be given as chained. (i.e &quot;scripts.compile&quot;)</p>

**Kind**: instance method of [<code>DataObject</code>](#DataObject)  
**Returns**: <code>this</code> - <ul>

<li>Object instance.</li>
</ul>  

| Param           | Type                                                   | Default            | Description                                                            |
| --------------- | ------------------------------------------------------ | ------------------ | ---------------------------------------------------------------------- |
| path            | <code>string</code> \| <code>Array.&lt;Path&gt;</code> |                    | <p>Path or list of paths to remove</p>                                 |
| [options]       | <code>Object</code>                                    |                    | <p>Options</p>                                                         |
| [options.force] | <code>boolean</code>                                   | <code>false</code> | <p>Whether to force change even value is altered by user manually.</p> |

<a name="DataObject+reset"></a>

### dataObject.reset() ⇒ <code>Array.&lt;Operation&gt;</code>

<p>Resets data and snapshot to its original states.</p>

**Kind**: instance method of [<code>DataObject</code>](#DataObject)  
**Returns**: <code>Array.&lt;Operation&gt;</code> - <ul>

<li>Unapplied operations</li>
</ul>  
<a name="ResettableFile"></a>

## ResettableFile

<p>Provides utility class and methods for boilerplate projects to create/copy/remove files, directories and data files (json/yaml).
Created files, directories and data files are tracked and recorded to a json file, and modifications done by this library can be undone
by <code>reset()</code> method.</p>

**Kind**: global class

* [ResettableFile](#ResettableFile)
  * [new ResettableFile(registryFile, [options])](#new_ResettableFile_new)
  * [.root](#ResettableFile+root) : <code>string</code>
  * [.sourceRoot](#ResettableFile+sourceRoot) : <code>string</code>
  * [.track](#ResettableFile+track) : <code>boolean</code>
  * [.logger](#ResettableFile+logger) : <code>BasicLogger</code>
  * [.logLevel](#ResettableFile+logLevel) : <code>string</code>
  * [.fromRoot(...part)](#ResettableFile+fromRoot) ⇒ <code>string</code>
  * [.fromSourceRoot(...part)](#ResettableFile+fromSourceRoot) ⇒ <code>string</code>
  * [.isDataFile(projectFile)](#ResettableFile+isDataFile) ⇒ <code>boolean</code>
  * [.hasFileSync(projectFiles, [t], [f])](#ResettableFile+hasFileSync) ⇒ <code>\*</code>
  * [.saveSync()](#ResettableFile+saveSync) ⇒ <code>void</code>
  * [.resetSync()](#ResettableFile+resetSync) ⇒ <code>void</code>
  * [.resetFileSync(projectFile)](#ResettableFile+resetFileSync) ⇒ <code>void</code>
  * [.getFileDetailsSync(projectFile, options)](#ResettableFile+getFileDetailsSync) ⇒ <code>FileDetail</code>
  * [.getFileHashSync(projectFile)](#ResettableFile+getFileHashSync) ⇒ <code>string</code>
  * [.getDataObjectSync(projectFile, [options])](#ResettableFile+getDataObjectSync) ⇒ [<code>DataObject</code>](#DataObject)
  * [.createSymLinkSync(targetFile, projectFile, [options])](#ResettableFile+createSymLinkSync) ⇒ <code>void</code>
  * [.readFileSync(projectFile, [options])](#ResettableFile+readFileSync) ⇒ <code>\*</code>
  * [.readFileDetailedSync(projectFile, [options])](#ResettableFile+readFileDetailedSync) ⇒ <code>Object</code>
  * [.writeFileSync(projectFile, data, [options])](#ResettableFile+writeFileSync) ⇒ <code>void</code>
  * [.deleteFileSync(projectFile, [options])](#ResettableFile+deleteFileSync) ⇒ <code>void</code>
  * [.copyFileSync(sourceFile, projectFile, [options])](#ResettableFile+copyFileSync) ⇒ <code>void</code>
  * [.createDirSync(projectDir, [options])](#ResettableFile+createDirSync) ⇒ <code>void</code>
  * [.deleteDirSync(projectDir, [options])](#ResettableFile+deleteDirSync) ⇒ <code>void</code>

<a name="new_ResettableFile_new"></a>

### new ResettableFile(registryFile, [options])

| Param                | Type                     | Default                                     | Description                                                                                                                                                         |
| -------------------- | ------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| registryFile         | <code>string</code>      |                                             | <p>Path of the registry file. Registry file's directory is also root directory.</p>                                                                                 |
| [options]            | <code>Object</code>      |                                             | <p>Options</p>                                                                                                                                                      |
| [options.sourceRoot] | <code>string</code>      |                                             | <p>Source root. If provided all source files are calculated relative to this path for copy, symbolic link etc.</p>                                                  |
| [options.track]      | <code>boolean</code>     |                                             | <p>Sets default tracking option for methods.</p>                                                                                                                    |
| [options.logLevel]   | <code>string</code>      | <code>&quot;\&quot;warn\&quot;&quot;</code> | <p>Sets log level if default logger is used. (&quot;error&quot;, &quot;warn&quot;, &quot;info&quot;, &quot;debug&quot;, &quot;verbose&quot;, &quot;silly&quot;)</p> |
| [options.logger]     | <code>BasicLogger</code> |                                             | <p>A looger instance such as winston. Must implement <code>info</code>, <code>warn</code>, <code>error</code>, <code>verbose</code>, <code>silly</code>.</p>        |

<a name="ResettableFile+root"></a>

### resettableFile.root : <code>string</code>

<p>Root path for files to be managed. It is the directory registry file is located.</p>

**Kind**: instance property of [<code>ResettableFile</code>](#ResettableFile)  
**Read only**: true  
<a name="ResettableFile+sourceRoot"></a>

### resettableFile.sourceRoot : <code>string</code>

<p>Source root path for files to be managed. It is the source root directory given during object construction.</p>

**Kind**: instance property of [<code>ResettableFile</code>](#ResettableFile)  
**Read only**: true  
<a name="ResettableFile+track"></a>

### resettableFile.track : <code>boolean</code>

<p>Whether files of the project are tracked by default.</p>

**Kind**: instance property of [<code>ResettableFile</code>](#ResettableFile)  
**Read only**: true  
<a name="ResettableFile+logger"></a>

### resettableFile.logger : <code>BasicLogger</code>

<p>Returns logger object which provides <code>error</code>, <code>warn</code>, <code>info</code>, <code>debug</code>, <code>verbose</code>, <code>silly</code> methods.</p>

**Kind**: instance property of [<code>ResettableFile</code>](#ResettableFile)  
**Read only**: true  
<a name="ResettableFile+logLevel"></a>

### resettableFile.logLevel : <code>string</code>

<p>Log level if default logger is used. (&quot;none&quot;, &quot;error&quot;, &quot;warn&quot;, &quot;info&quot;, &quot;debug&quot;, &quot;verbose&quot;, &quot;silly&quot;)</p>

**Kind**: instance property of [<code>ResettableFile</code>](#ResettableFile)  
<a name="ResettableFile+fromRoot"></a>

### resettableFile.fromRoot(...part) ⇒ <code>string</code>

<p>Returns given path after prepending it to the root. Path may be given as a single string or in multiple parts.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Returns**: <code>string</code> - <ul>

<li>Path in root.</li>
</ul>  

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| ...part | <code>string</code> | <p>Path or path parts to get full path in root.</p> |

**Example**

```js
const resettable = new ResettableFile({ registryFile: "dir/registry.json" });
resettable.fromRoot("path/to/file.txt"); // dir/path/to/file.txt
```

<a name="ResettableFile+fromSourceRoot"></a>

### resettableFile.fromSourceRoot(...part) ⇒ <code>string</code>

<p>Returns given path after prepending it to the source root. Path may be given as a single string or in multiple parts.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Returns**: <code>string</code> - <ul>

<li>Path in root.</li>
</ul>  

| Param   | Type                | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| ...part | <code>string</code> | <p>Path or path parts to get full path in root.</p> |

**Example**

```js
const resettable = new ResettableFile({ sourceRoot: "sourcedir" });
resettable.fromSourceRoot("path/to/file.txt"); // sourcedir/path/to/file.txt
```

<a name="ResettableFile+isDataFile"></a>

### resettableFile.isDataFile(projectFile) ⇒ <code>boolean</code>

<p>Checks whether given file is a tracked data file.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Returns**: <code>boolean</code> - <ul>

<li>Whether given file is a tracked data file.</li>
</ul>  

| Param       | Type                | Description          |
| ----------- | ------------------- | -------------------- |
| projectFile | <code>string</code> | <p>File to check</p> |

<a name="ResettableFile+hasFileSync"></a>

### resettableFile.hasFileSync(projectFiles, [t], [f]) ⇒ <code>\*</code>

<p>Returns one of the given values based on existence of given file path or file paths in root.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Returns**: <code>\*</code> - <ul>

<li><code>t</code> or <code>f</code> value based on existence of files in root.</li>
</ul>  

| Param        | Type                                                     | Default            | Description                                                 |
| ------------ | -------------------------------------------------------- | ------------------ | ----------------------------------------------------------- |
| projectFiles | <code>string</code> \| <code>Array.&lt;string&gt;</code> |                    | <p>File or list of files to look in root.</p>               |
| [t]          | <code>\*</code>                                          | <code>true</code>  | <p>Value to return if any of the files exists in root.</p>  |
| [f]          | <code>\*</code>                                          | <code>false</code> | <p>Value to return if none of the files exists in root.</p> |

<a name="ResettableFile+saveSync"></a>

### resettableFile.saveSync() ⇒ <code>void</code>

<p>Saves data files and registry file. Must be called if any changes are made.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Throws**:

* <code>VError</code> <ul>
  <li>Throws error if files cannot be written</li>
  </ul>

<a name="ResettableFile+resetSync"></a>

### resettableFile.resetSync() ⇒ <code>void</code>

<p>Resets modifications made by this library by deleting created files and returns data files in original state.
WARNING: Does not recreate deleted files.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Throws**:

* <code>VError</code> <ul>
  <li>Throws error if files cannot be written</li>
  </ul>

<a name="ResettableFile+resetFileSync"></a>

### resettableFile.resetFileSync(projectFile) ⇒ <code>void</code>

<p>Resets given file.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Throws**:

* <code>VError</code> <ul>
  <li>Throws error if file cannot be reset.</li>
  </ul>

| Param       | Type                | Description          |
| ----------- | ------------------- | -------------------- |
| projectFile | <code>string</code> | <p>File to reset</p> |

<a name="ResettableFile+getFileDetailsSync"></a>

### resettableFile.getFileDetailsSync(projectFile, options) ⇒ <code>FileDetail</code>

<p>Returns file details related to given file path relative to root.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Returns**: <code>FileDetail</code> - <ul>

<li>File details</li>
</ul>  
**Throws**:

* <code>VError</code> <ul>
  <li>Throws error if file details cannot be get.</li>
  </ul>

| Param         | Type                 | Description                                                        |
| ------------- | -------------------- | ------------------------------------------------------------------ |
| projectFile   | <code>string</code>  | <p>File to get detail for.</p>                                     |
| options       | <code>Object</code>  | <p>Options</p>                                                     |
| options.force | <code>boolean</code> | <p>Assume safe to operate on file even it is not auto created.</p> |
| options.track | <code>boolean</code> | <p>Whether to track file if it is created by module.</p>           |

<a name="ResettableFile+getFileHashSync"></a>

### resettableFile.getFileHashSync(projectFile) ⇒ <code>string</code>

<p>Calculates and returns hash for given file relative to root. For js, json and yaml files, ignores format differences and returns
same hash for same data even they are formatted differently.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Returns**: <code>string</code> - <ul>

<li>Calculated hash for file.</li>
</ul>  

| Param       | Type                | Description                                                          |
| ----------- | ------------------- | -------------------------------------------------------------------- |
| projectFile | <code>string</code> | <p>File path of the file relative to root to calculate hash for.</p> |

<a name="ResettableFile+getDataObjectSync"></a>

### resettableFile.getDataObjectSync(projectFile, [options]) ⇒ [<code>DataObject</code>](#DataObject)

<p>Reads json or yaml data file and returns [DataObject](#DataObject) instance. Records changes made to object and writes them to registry file to be cleared when necessary.
Changes made are saved to same file when project is saved via <code>save()</code> method.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Returns**: [<code>DataObject</code>](#DataObject) - <ul>

<li>[DataObject](#DataObject) instance.</li>
</ul>  
**Throws**:

* <code>VError</code> <ul>
  <li>Throws error if file cannot be created.</li>
  </ul>

| Param                    | Type                              | Default                       | Description                                                                                                             |
| ------------------------ | --------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| projectFile              | <code>string</code>               |                               | <p>File path to read relative to root.</p>                                                                              |
| [options]                | <code>Object</code>               |                               | <p>Options</p>                                                                                                          |
| [options.create]         | <code>boolean</code>              | <code>false</code>            | <p>Whether to create file if it does not exist.</p>                                                                     |
| [options.defaultContent] | <code>Object</code>               |                               | <p>Default content to write if file is created.</p>                                                                     |
| [options.throwNotExists] | <code>boolean</code>              | <code>true</code>             | <p>Throw error if file does not exist.</p>                                                                              |
| [options.format]         | <code>boolean</code>              | <code>[file extension]</code> | <p>Format to serialize data in given format. (<code>json</code> or <code>yaml</code>) Default is <code>json</code>.</p> |
| [options.createFormat]   | <code>boolean</code>              | <code>&quot;json&quot;</code> | <p>Format to serialize data in given format. (<code>json</code> or <code>yaml</code>) Default is <code>json</code>.</p> |
| [options.track]          | <code>boolean</code>              | <code>[this.track]</code>     | <p>Whether to track file in registry if it is created by module.</p>                                                    |
| [options.force]          | <code>boolean</code>              | <code>false</code>            | <p>Whether to force write file even it exist.</p>                                                                       |
| [options.sortKeys]       | <code>Array.&lt;string&gt;</code> |                               | <p>List of keys which their values shoud be sorted. Key names be paths like &quot;scripts.test&quot;</p>                |

<a name="ResettableFile+createSymLinkSync"></a>

### resettableFile.createSymLinkSync(targetFile, projectFile, [options]) ⇒ <code>void</code>

<p>Creates a symbolic link in project which points to a file in module. Removes previously created symbolic link created by this library.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Throws**:

* <code>VError</code> <ul>
  <li>Throws error if symbolic link cannot be created.</li>
  </ul>

| Param           | Type                 | Default                   | Description                                                                       |
| --------------- | -------------------- | ------------------------- | --------------------------------------------------------------------------------- |
| targetFile      | <code>string</code>  |                           | <p>Target file which link points to. Should be given relative to module root.</p> |
| projectFile     | <code>string</code>  |                           | <p>Link file. Should be given relative to project root.</p>                       |
| [options]       | <code>Object</code>  |                           | <p>Options</p>                                                                    |
| [options.force] | <code>boolean</code> | <code>false</code>        | <p>Writes file even it exists and not auto created.</p>                           |
| [options.track] | <code>boolean</code> | <code>[this.track]</code> | <p>Whether to track symlink if it is created by module.</p>                       |

**Example**

```js
// Creates tsconfig.json symbolic link file in project root, pointing to a file from toolkit.
createSymLink(here("../../config.json"), "tsconfig.json");
```

<a name="ResettableFile+readFileSync"></a>

### resettableFile.readFileSync(projectFile, [options]) ⇒ <code>\*</code>

<p>Reads and returns content of the given file relative to root. Optionally can create file if it does not exist.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Returns**: <code>\*</code> - <ul>

<li>Content of the file.</li>
</ul>  
**Throws**:

* <code>VError</code> <ul>
  <li>Throws error if file cannot be found.</li>
  </ul>

| Param                    | Type                 | Default                       | Description                                                                                 |
| ------------------------ | -------------------- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| projectFile              | <code>string</code>  |                               | <p>File to read relative to root.</p>                                                       |
| [options]                | <code>Object</code>  |                               | <p>Options</p>                                                                              |
| [options.create]         | <code>boolean</code> | <code>false</code>            | <p>Whether to create file if it does not exist.</p>                                         |
| [options.track]          | <code>boolean</code> | <code>[this.track]</code>     | <p>Whether to track file in registry if it is created by module.</p>                        |
| [options.force]          | <code>boolean</code> | <code>false</code>            | <p>Whether to force create even it is deleted by user.</p>                                  |
| [options.defaultContent] | <code>\*</code>      |                               | <p>Default content to write if file does not exist.</p>                                     |
| [options.throwNotExists] | <code>boolean</code> | <code>true</code>             | <p>Throw error if file does not exist.</p>                                                  |
| [options.parse]          | <code>boolean</code> | <code>false</code>            | <p>Whether to parse file content to create a js object.</p>                                 |
| [options.format]         | <code>Format</code>  | <code>[file extension]</code> | <p>Format to use parsing data.</p>                                                          |
| [options.createFormat]   | <code>Format</code>  | <code>json</code>             | <p>Format to be used while creating nonexisting file if no format is provided.</p>          |
| [options.serialize]      | <code>Format</code>  | <code>[parse]</code>          | <p>Whether to serialize content if file is created. (Default is status of parse option)</p> |

<a name="ResettableFile+readFileDetailedSync"></a>

### resettableFile.readFileDetailedSync(projectFile, [options]) ⇒ <code>Object</code>

<p>Reads and returns content and format of the given file relative to project root. Optionally can create file if it does not exist.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Returns**: <code>Object</code> - <ul>

<li>Content of the file.</li>
</ul>  
**Throws**:

* <code>VError</code> <ul>
  <li>Throws error if file cannot be found.</li>
  </ul>

| Param                    | Type                 | Default                       | Description                                                                                 |
| ------------------------ | -------------------- | ----------------------------- | ------------------------------------------------------------------------------------------- |
| projectFile              | <code>string</code>  |                               | <p>File to read relative to project root.</p>                                               |
| [options]                | <code>Object</code>  |                               | <p>Options</p>                                                                              |
| [options.create]         | <code>boolean</code> | <code>false</code>            | <p>Whether to create file if it does not exist.</p>                                         |
| [options.track]          | <code>boolean</code> | <code>[this.track]</code>     | <p>Whether to track file in registry if it is created by module.</p>                        |
| [options.force]          | <code>boolean</code> | <code>false</code>            | <p>Whether to force create even it is deleted by user.</p>                                  |
| [options.defaultContent] | <code>\*</code>      |                               | <p>Default content to write if file does not exist.</p>                                     |
| [options.throwNotExists] | <code>boolean</code> | <code>true</code>             | <p>Throw error if file does not exist.</p>                                                  |
| [options.parse]          | <code>boolean</code> | <code>false</code>            | <p>Whether to parse file content to create a js object.</p>                                 |
| [options.format]         | <code>Format</code>  | <code>[file extension]</code> | <p>Format to use parsing data.</p>                                                          |
| [options.createFormat]   | <code>Format</code>  | <code>json</code>             | <p>Format to be used while creating nonexisting file if no format is provided.</p>          |
| [options.serialize]      | <code>Format</code>  | <code>[parse]</code>          | <p>Whether to serialize content if file is created. (Default is status of parse option)</p> |

<a name="ResettableFile+writeFileSync"></a>

### resettableFile.writeFileSync(projectFile, data, [options]) ⇒ <code>void</code>

<p>Creates and writes given data to a file in project.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Throws**:

* <code>VError</code> <ul>
  <li>Throws error if file cannot be created</li>
  </ul>

| Param               | Type                 | Default                       | Description                                                                                                             |
| ------------------- | -------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| projectFile         | <code>string</code>  |                               | <p>File path to relative to project root.</p>                                                                           |
| data                | <code>string</code>  |                               | <p>Data to write</p>                                                                                                    |
| [options]           | <code>Object</code>  |                               | <p>Options</p>                                                                                                          |
| [options.force]     | <code>boolean</code> | <code>false</code>            | <p>Writes file even it exists and not auto created.</p>                                                                 |
| [options.track]     | <code>boolean</code> | <code>[this.track]</code>     | <p>Whether to track file in registry if it is created by module.</p>                                                    |
| [options.serialize] | <code>boolean</code> | <code>false</code>            | <p>Whether to serialize object before written to file.</p>                                                              |
| [options.format]    | <code>Format</code>  | <code>[file extension]</code> | <p>Format to use serializing data.</p>                                                                                  |
| [options.sortKeys]  | <code>Array</code>   |                               | <p>Keys to be sorted. Keys may be given as chained paths. (i.e. <code>a.b.c</code> -&gt; Keys of c would be sorted)</p> |

**Example**

```js
project.writeFile("./some-config.json", '{"name": "my-project"}'); // Writes given data to some-config.json in project root.
```

<a name="ResettableFile+deleteFileSync"></a>

### resettableFile.deleteFileSync(projectFile, [options]) ⇒ <code>void</code>

<p>Deletes a file from project. Path should be given relative to project root.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Throws**:

* <code>VError</code> <ul>
  <li>Throws error if file cannot be deleted.</li>
  </ul>

| Param           | Type                 | Default                   | Description                                                                                                           |
| --------------- | -------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| projectFile     | <code>string</code>  |                           | <p>File path relative to paroject root.</p>                                                                           |
| [options]       | <code>Object</code>  |                           | <p>Options</p>                                                                                                        |
| [options.force] | <code>boolean</code> | <code>false</code>        | <p>Deletes file even it exists and not auto created.</p>                                                              |
| [options.track] | <code>boolean</code> | <code>[this.track]</code> | <p>Whether to operate in tracked mode. In non-tracked mode existing files are not deleted if force is not active.</p> |
| [options.log]   | <code>boolean</code> | <code>true</code>         | <p>Whether to log operation.</p>                                                                                      |

**Example**

```js
project.copy("./some-config.json", "./some-config.json"); // Copies some-config.json file from module's root to project's root.
```

<a name="ResettableFile+copyFileSync"></a>

### resettableFile.copyFileSync(sourceFile, projectFile, [options]) ⇒ <code>void</code>

<p>Copies a file from module to project. Paths should be given relative to module root and project root.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Throws**:

* <code>VError</code> <ul>
  <li>Throws error if file cannot be created</li>
  </ul>

| Param           | Type                 | Default                   | Description                                                          |
| --------------- | -------------------- | ------------------------- | -------------------------------------------------------------------- |
| sourceFile      | <code>string</code>  |                           | <p>Source file path.</p>                                             |
| projectFile     | <code>string</code>  |                           | <p>Destinantion file path relative to paroject root.</p>             |
| [options]       | <code>Object</code>  |                           | <p>Options</p>                                                       |
| [options.force] | <code>boolean</code> | <code>false</code>        | <p>Overwrites file even it exists and not auto created.</p>          |
| [options.track] | <code>boolean</code> | <code>[this.track]</code> | <p>Whether to track file in registry if it is created by module.</p> |

**Example**

```js
project.copy("./some-config.json", "./some-config.json"); // Copies some-config.json file from module's root to project's root.
```

<a name="ResettableFile+createDirSync"></a>

### resettableFile.createDirSync(projectDir, [options]) ⇒ <code>void</code>

<p>Creates given directory and its tree relative to project root.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Throws**:

* <code>VError</code> <ul>
  <li>Throws error if directory tree cannot be created.</li>
  </ul>

| Param             | Type                 | Default                   | Description                                                          |
| ----------------- | -------------------- | ------------------------- | -------------------------------------------------------------------- |
| projectDir        | <code>string</code>  |                           | <p>Directory path to relative to project root.</p>                   |
| [options]         | <code>Object</code>  |                           | <p>Options</p>                                                       |
| [options.track]   | <code>boolean</code> | <code>[this.track]</code> | <p>Whether to track file in registry if it is created by module.</p> |
| [options.logDirs] | <code>boolean</code> | <code>true</code>         | <p>Whether to log delete operation of sub directories.</p>           |

**Example**

```js
project.createDir("path/to/dir"); // Created "path", "to" and "dir" as necessary.
```

<a name="ResettableFile+deleteDirSync"></a>

### resettableFile.deleteDirSync(projectDir, [options]) ⇒ <code>void</code>

<p>Deletes directory if empty or all of it's contents are created by this library. <code>force</code> option may be used to delete non-empty directories.</p>

**Kind**: instance method of [<code>ResettableFile</code>](#ResettableFile)  
**Throws**:

* <code>VError</code> <ul>
  <li>Throws error if directory or its content cannot be deleted.</li>
  </ul>

| Param              | Type                 | Default                   | Description                                                          |
| ------------------ | -------------------- | ------------------------- | -------------------------------------------------------------------- |
| projectDir         | <code>string</code>  |                           | <p>Destinantion directory to delete.</p>                             |
| [options]          | <code>Object</code>  |                           | <p>Options</p>                                                       |
| [options.force]    | <code>boolean</code> | <code>false</code>        | <p>Deletes directory and it's contents even it is not empty.</p>     |
| [options.track]    | <code>boolean</code> | <code>[this.track]</code> | <p>Whether to track file in registry if it is created by module.</p> |
| [options.logFiles] | <code>boolean</code> | <code>true</code>         | <p>Whether to log delete operation of files.</p>                     |
| [options.logDirs]  | <code>boolean</code> | <code>true</code>         | <p>Whether to log delete operation of sub directories.</p>           |
