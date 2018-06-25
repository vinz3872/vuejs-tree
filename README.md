VueJS Tree
==========

[![npm version](https://img.shields.io/npm/v/vuejs-tree.svg?style=flat)](https://www.npmjs.com/package/vuejs-tree)

A highly customizable vuejs tree viewer


![tree](https://raw.githubusercontent.com/scalia/vuejs-tree/7b6d80f7362cdaf0da9eba9997a9b132c5b99e7b/images/tree.png)


## Getting Started

### Install

You can install using yarn:

```bash
$ yarn add vuejs-tree
```

or with npm:

```bash
$ npm install vuejs-tree
```


### Usage

Add the following lines at the top of your .js file which contains your Vue instance.

```javascript
  import Tree from 'vuejs-tree'
  Vue.use(Tree)

  // in your vue instance
  methods: {
    getTree: function(treeId) {
      for (var i = 0; i < this.$children.length; i++) {
        if (this.$children[i].$props.id == treeId) return this.$children[i]
      }
    }
  }

```

Or add the following lines in your Vue instance.

```javascript
  import Tree from 'vuejs-tree'


  // in your vue instance
  components: {
    'tree': Tree
  },
  methods: {
    getTree: function(treeId) {
      for (let i = 0; i < this.$children.length; i++) {
        if (this.$children[i].$props.id == treeId) return this.$children[i]
      }
    }
  }
```


Then add the following line in your html file to generate a tree. You can have as many trees per page as you want.
```html
  <tree id="my-tree-id" :custom-options="myCustomOptions" :nodes="treeDisplayData"></tree>
```


## Data Structure

You need to define data to display which is a nested array of hash.

Example:

```javascript
var nodes = [
  {
    text: "Root 1",
    nodes: [
      {
        text: "Child 1",
        nodes: [
          {
            text: "Grandchild 1"
          },
          {
            text: "Grandchild 2"
          }
        ]
      },
      {
        text: "Child 2"
      }
    ]
  },
  {
    text: "Root 2"
  }
];
```

### Node properties

Here is a fully customized node:

```javascript
{
  id: 1,
  text: "Root 1",
  definition: "First node",
  depth: 1,
  checkable: false,
  selectable: false,
  expandable: true,
  disabled: false,
  tags: [42],
  state: {
    checked: false,
    expanded: false,
    selected: false
  },
  nodes: [
    {},
    ...
  ]
}
```

The Following properties define a node level css and behavior.

#### id
`String` or `Integer` --> `Mandatory`

Used in the tree to differentiate each nodes.

#### name
`String` --> `Mandatory`

The text value displayed at the right of the node icons.

#### definition
`String` --> `Optional`

If some text is given, then it will show as a tooltip.

#### depth
`Integer` --> `Optional`

It correspond to the node depth, starting from 0, 1 or anything.
It's advisable to fill theses fields if somes of your nodes have the same id.

#### disabled
`Boolean` --> `Optional`, `default`: false

Used to specifie if the node is disabled or not.

#### tags
`[Integer]` --> `Optional`

The tag is displayed at the right end of the line.

#### checkable
`Boolean` --> `Optional`, `default`: true

Used to enable or disable the check event.

#### selectable
`Boolean` --> `Optional`, `default`: true

Used to enable or disable the select event.

#### expandable
`Boolean` --> `Optional`, `default`: true

Used to enable or disable the expand event.

#### state

##### checkable
`Boolean` --> `Optional`, `default`: true

Another way to enable or disable the check event.

##### selectable
`Boolean` --> `Optional`, `default`: true

Another way to enable or disable the select event.

##### expandable
`Boolean` --> `Optional`, `default`: true

Another way to enable or disable the expand event.


#### nodes
`Object` --> `Optional`

Used to display node's children.
*Look above for a structure example*

## Options

Here is an example of a customOptions hash the tree take.
I suggest you to use a vuejs computed function if you want to use function pointer.
For the icons, it's only compatible with `Font Awesome`.

```javascript
var customOptions = {
  icon: "fa-folder",
  iconColor: "#007AD5",
  selectedIcon: "fa-folder-open",
  selectedIconColor: "#2ECC71",
  addElemIcon: 'fa-plus',
  addElemIconColor: '#007AD5',
  style: {
    tree: 'overflow: hidden; border: none;',
    row: 'background-color: blue;'
  },
  treeEvents: {
    expanded: {
      state: true,
      fn: this.updateNodes
    },
    collapsed: {
      state: true,
      fn: this.updateNodes
    },
    checked: {
      state: true,
      fn: this.updateNodeChecked
    }
  },
  events: {
    selected: {
      state: false,
      fn: null
    },
    editableName: {
      state: true,
      calledEvent: 'expanded'
    }
  }
}
```


Option name       | detail
------------------|-------
icon              | node folder icon
iconColor         | folder's icon color
selectedIcon      | node's icon when selected
selectedIconColor | node icon's color when selected
addElemIcon       | icon to add a node
addElemIconColor  | add node icon's color
style             |
tree              | override default tree css
row               | override default tree node css



## Events

### Tree
You can call your own function here by assigning a function pointer in the tree options and changing it's state to true.
These functions are called after all tree modification.

#### nodeSelected
Called when a node is selected.
`treeOptions.treeEvents.selected.fn`

#### nodeExpanded && nodeCollapsed
Called when a node is expanded.
`treeOptions.treeEvents.expanded.fn`

Called when a node is collapsed.
`treeOptions.treeEvents.collapsed.fn`

#### nodeChecked
Called when a node is collapsed.
`treeOptions.treeEvents.checked.fn`

### Tree row
You can call your own function here by assigning a function pointer in the tree options. It will replace the existing behavior of the tree for this event.
You can also disabled an event by changing it's state to false.

#### toggleSelected
Called when a node is selected.
`treeOptions.events.selected.fn`

#### toggleExpanded
Called when a node is expanded or collapsed.
`treeOptions.events.expanded.fn`

#### toggleChecked
Called when a node is checked.
`treeOptions.events.checked.fn`

#### editableName
You can call a special function who can be used to edit a node, usually with Ajax request, if you assign it's pointer
`treeOptions.events.editableName.fn`
Or you can call an existing event by assigining it's name in
`treeOptions.events.editableName.calledEvent`
example : `treeOptions.events.editableName.calledEvent = 'selected'`

## Methods

Methods Params:

`depth` --> Optionnal but help distinguish nodes with the same id.

`argWanted` --> It can either be a node attribute name (string) or a array of node attribute name (like ['id', 'name']).

`format` --> If you want the function to return an plain array (false) or a hash tree (true).

`maxDepth` --> The function will only access nodes within the maxDepth.

`fullNode` --> Return only node ids or node objects.

`conditions` --> It' used to affect only the nodes who match it. For example if the condition is {checked: true}, the function will affect only the nodes who are checked. You can use all nodes attribute that are present in the node object.

#### checkNode(nodeId, depth)
Check a node.

#### uncheckNode(nodeId, depth)
Uncheck a node.

#### getSelectedNode()
Return the selected node if you have selected a node.

#### getCheckedNodes(argWanted, format = false)
Return all checked nodes.

#### getExpandedNodes(argWanted, format = false)
Return all expanded nodes.

#### checkAllNodes()
Check all nodes.

#### uncheckAllNodes()
Uncheck all nodes.

#### expandNode(nodeId, depth)
Expand a node.

#### collapseNode(nodeId, depth)
Collapse a node.

#### selectNode(nodeId, depth)
Select a node and deselect the previously selected node if exist.

#### expandAllNodes()
Expand all nodes.

#### collapseAllNodes()
Collapse all nodes.

#### deselectAllNodes()
Deselect all nodes.

#### findNode(nodeId, maxDepth = 9999)
Find and return a node.

#### getVisibleNodes(fullNode = false)
Get all visible nodes.

#### getNodesData(argWanted, conditions = {}, format = false)
Customizable function that return nodes.

### Get the tree instance

If you want to call any tree method, you need to get the instance.

For that you just need to call the `getTree` function and provide your tree `id`.
