export interface NodeData {
  state: {
    checked: boolean;
    expanded: boolean;
    selected: boolean;
    [key: string]: any;
  }
  nodes?: NodeData[];
  id: string;
  depth: number;
  [key: string]: any;
}

export interface NodesProperties {
  [key: string]: any;
}

export interface EventParams {
  state: boolean;
  fn: any;
  appearOnHover?: boolean;
  calledEvent?: string|null;
}

export interface TreeCustomStyles {
  tree: {
    style: {
      [key: string]: string;
    }
  }
}

export interface TreeRowCustomStyles {
  row: {
    style: {
      [key: string]: string;
    }
    child: {
      class: string;
      style: {
        [key: string]: string;
      }
      active: {
        class: string;
        style: {
          [key: string]: string;
        }
      }
    }
  }
  rowIndent: {
    [key: string]: string;
  }
  expanded: {
    class: string;
  }
  addNode: {
    class: string;
    style: {
      [key: string]: string;
    }
  }
  editNode: {
    class: string;
    style: {
      [key: string]: string;
    }
  }
  deleteNode: {
    class: string;
    style: {
      [key: string]: string;
    }
  }
  selectIcon: {
    class: string;
    style: {
      [key: string]: string;
    },
    active: {
      class: string;
      style: {
        [key: string]: string;
      }
    }
  }
  text: {
    style: {
      [key: string]: string;
    },
    class: string;
    active: {
      style: {
        [key: string]: string;
      }
    }
  }
}

export interface TreeCustomOptions {
  treeEvents: {
    expanded: EventParams;
    collapsed: EventParams;
    selected: EventParams;
    checked: EventParams;
  }
}

export interface TreeRowCustomOptions {
  events: {
    expanded: EventParams;
    selected: EventParams;
    checked: EventParams;
    editableName: EventParams;
  }
  addNode: EventParams;
  editNode: EventParams;
  deleteNode: EventParams;
  showTags: boolean
}
