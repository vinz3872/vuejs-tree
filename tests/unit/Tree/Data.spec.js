import { mount } from '@vue/test-utils'
import Tree from '@/components/Tree.vue'

import data from './data.js'

describe('Data', () => {
  it('has default values', () => {
    const { nodes } = data
    const propsData = {
      nodes
    }
    const wrapper = mount(Tree, {
      propsData: propsData
    })
    const tree = wrapper.vm
    expect(tree.selectedNode).toBeNull()
    expect(tree.force).toBeTruthy()
    expect(tree.styles.tree).toHaveProperty('height', 'auto');
    expect(tree.styles.tree).toHaveProperty('maxHeight', '500px');
    expect(tree.styles.tree).toHaveProperty('overflowY', 'scroll');
    expect(tree.styles.tree).toHaveProperty('display', 'inline-block');
    expect(tree.options.treeEvents.expanded).toHaveProperty('state', false);
    expect(tree.options.treeEvents.expanded).toHaveProperty('fn', null);
    expect(tree.options.treeEvents.collapsed).toHaveProperty('state', false);
    expect(tree.options.treeEvents.collapsed).toHaveProperty('fn', null);
    expect(tree.options.treeEvents.selected).toHaveProperty('state', false);
    expect(tree.options.treeEvents.selected).toHaveProperty('fn', null);
    expect(tree.options.treeEvents.checked).toHaveProperty('state', false);
    expect(tree.options.treeEvents.checked).toHaveProperty('fn', null);
  })

  it('can be overwriten', () => {
    const fn = jest.fn()
    const customOptions = {
      treeEvents: {
        expanded: {
          state: true,
          fn: fn
        },
        collapsed: {
          state: true,
          fn: fn
        },
        selected: {
          state: true,
          fn: fn
        },
        checked: {
          state: true,
          fn: fn
        }
      }
    }
    let { customStyles, nodes } = data
    const propsData = {
      customOptions,
      customStyles,
      nodes
    }
    const wrapper = mount(Tree, {
      propsData: propsData
    })
    const tree = wrapper.vm
    expect(tree.selectedNode).toBeNull()
    expect(tree.force).toBeTruthy()
    expect(tree.styles.tree).toHaveProperty('height', customStyles.tree.height);
    expect(tree.styles.tree).toHaveProperty('maxHeight', customStyles.tree.maxHeight);
    expect(tree.styles.tree).toHaveProperty('overflowY', customStyles.tree.overflowY);
    expect(tree.styles.tree).toHaveProperty('display', customStyles.tree.display);
    expect(tree.options.treeEvents.expanded).toHaveProperty('state', true);
    expect(tree.options.treeEvents.expanded).toHaveProperty('fn', fn);
    expect(tree.options.treeEvents.collapsed).toHaveProperty('state', true);
    expect(tree.options.treeEvents.collapsed).toHaveProperty('fn', fn);
    expect(tree.options.treeEvents.selected).toHaveProperty('state', true);
    expect(tree.options.treeEvents.selected).toHaveProperty('fn', fn);
    expect(tree.options.treeEvents.checked).toHaveProperty('state', true);
    expect(tree.options.treeEvents.checked).toHaveProperty('fn', fn);
  })

})
