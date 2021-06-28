<template>
  <Tree
    ref="my-tree"
    id="tree"
    :custom-options="myCustomOptions"
    :custom-styles="myCustomStyles"
    :nodes="treeDisplayData">
  </Tree>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
// import { Options, Vue } from 'vue-class-component'
import Tree from './components/Tree.vue'

@Options({
  components: {
    Tree
  }
})
export default class App extends Vue {
  treeDisplayData = [
    {
      text: 'Root 1',
      id: '1',
      state: { checked: false, selected: false, expanded: false },
      // checkable: false,
      nodes: [
        {
          text: 'Child 1',
          id: '3',
          state: { checked: false, selected: false, expanded: false },
          nodes: [
            {
              text: 'Grandchild 1',
              id: '5',
              state: { checked: false, selected: false, expanded: false }
            },
            {
              text: 'Grandchild 2',
              id: '6',
              state: { checked: false, selected: false, expanded: false }
            }
          ]
        },
        {
          text: 'Child 2',
          id: '4',
          state: { checked: false, selected: false, expanded: false }
        }
      ]
    },
    {
      text: 'Root 2',
      id: '2',
      state: { checked: false, selected: false, expanded: false }
    }
  ]

  get myCustomStyles () {
    return {
      tree: {
        style: {
          height: 'auto',
          maxHeight: '300px',
          overflowY: 'visible',
          display: 'inline-block',
          textAlign: 'left'
        }
      },
      row: {
        style: {
          width: '500px',
          cursor: 'pointer'
        },
        child: {
          style: {
            height: '35px'
          },
          active: {
            style: {
              height: '35px'
            }
          }
        }
      },
      text: {
        style: {},
        active: {
          style: {
            'font-weight': 'bold',
            color: '#2ECC71'
          }
        }
      }
    }
  }

  get myCustomOptions () {
    return {
      treeEvents: {
        expanded: {
          state: false
        },
        collapsed: {
          state: false
        },
        selected: {
          state: false
        },
        checked: {
          state: true,
          fn: this.myCheckedFunction
        }
      },
      events: {
        expanded: {
          state: true
        },
        selected: {
          state: true
        },
        checked: {
          state: true
        },
        editableName: {
          state: true,
          calledEvent: 'expanded'
        }
      },
      addNode: {
        state: true,
        fn: this.addNodeFunction,
        appearOnHover: false
      },
      editNode: { state: false, fn: null, appearOnHover: false },
      deleteNode: {
        state: true,
        fn: this.deleteNodeFunction,
        appearOnHover: true
      },
      showTags: true
    }
  }

  mounted () {
    console.log('App mounted')
    this.checkNode('3')
    // this.expandNode('3')
    this.getTreeVisibleNodes()
    // this.selectNode('6')
    // this.collapseNode('1')
  }

  getTreeVisibleNodes () {
    console.log(`expanded nodes: ${(this.$refs['my-tree']! as any).getCheckedNodes('id')}`)
    // console.log(`expanded nodes: ${(this.$refs['my-tree']! as any).getExpandedNodes()}`)
    // console.log(`visible nodes: ${(this.$refs['my-tree']! as any).getVisibleNodes()}`)
  }

  selectNode (nodeId: string) {
    console.log(`checked nodes: ${(this.$refs['my-tree'] as any).selectNode(nodeId, 9999)}`)
    // console.log(`checked nodes: ${(this.$refs['my-tree'] as any).deselectAllNodes(nodeId)}`)
  }

  checkNode (nodeId: string) {
    console.log(`checked nodes: ${(this.$refs['my-tree'] as any).checkNode(nodeId)}`)
    // console.log(`checked all nodes: ${(this.$refs['my-tree'] as any).checkAllNodes()}`)
    // console.log(`unchecked nodes: ${(this.$refs['my-tree'] as any).uncheckNode(nodeId)}`)
    // console.log(`unchecked all nodes: ${(this.$refs['my-tree'] as any).uncheckAllNodes()}`)
  }

  expandNode (nodeId: string) {
    console.log(nodeId)
    // console.log(`expand all nodes: ${(this.$refs['my-tree'] as any).expandAllNodes()}`)
    console.log(`expand nodes: ${(this.$refs['my-tree'] as any).expandNode(nodeId)}`)
  }

  collapseNode (nodeId: string) {
    console.log(nodeId)
    console.log(`expand all nodes: ${(this.$refs['my-tree'] as any).collapseAllNodes()}`)
    // console.log(`expand nodes: ${(this.$refs['my-tree'] as any).collapseNode(nodeId)}`)
  }

  myCheckedFunction (nodeId: any, state: boolean) {
    console.log(`is ${nodeId} selected ? ${state}`)
  }

  deleteNodeFunction (node: any) {
    console.log(`must remove ${node.id}`)
  }

  addNodeFunction () {
    console.log('add node function')
  }
}
</script>
