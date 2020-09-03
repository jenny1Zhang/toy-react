////// 课程三
// 虚拟DOM的构建，虚拟DOM生成真实DOM，vdom比对

const RENDER_TO_DOM = Symbol('render to dom');

export class Component {
    constructor(){
        this.props = Object.create(null) 
        this.children = [];
        this._root = null;
        this._range = null;
    }
    setAttribute(name, value){
        this.props[name] = value;
    }
    appendChild(component){
        this.children.push(component)
    }
    get vdom(){
        return this.render().vdom;
    } 
    [RENDER_TO_DOM](range){
        this._range = range;
        this._vdom = this.vdom;
        this._vdom[RENDER_TO_DOM](range);
        // this.render()[RENDER_TO_DOM](range);
    }
    // 重新绘制的算法
    // rerender(){
    //     // 执行完deleteContents产生了一个全空的range,再插入range时，这个空的range会被包含到下一个(即相邻的)不空的range，所以插入时需要保证这个range是不空的
    //     // this._range.deleteContents();
    //     // this[RENDER_TO_DOM](this._range);
         
    //     // 创建新的range，把它放在oldRange的位置，
    //     let oldRange = this._range;
    //     let range = document.createRange();
    //     range.setStart(oldRange.startContainer, oldRange.startOffset);
    //     range.setEnd(oldRange.startContainer, oldRange.startOffset);
    //     this[RENDER_TO_DOM](range);
    //     // 插入完成之后，把oldRange的start挪到插入的内容之后，然后再把oldRange的所有内容删除
    //     oldRange.setStart(range.endContainer, range.endOffset);
    //     oldRange.deleteContents();
    // }
    // 对比算法
    update(){
        let isSameNode = (oldNode, newNode) => {
            // 类型不同
            if(oldNode.type !== newNode.type){
                return false;
            }
            //  属性不同
            for(let name in newNode.props){
                if(newNode.props[name] !== oldNode.props[name]){
                    return false;
                }
            }
            // 属性的数量不同
            if(Object.keys(oldNode.props).length > Object.keys(newNode.props).length){
                return false;
            }
            // 文本节点的内容不同
            if(newNode.type === '#text'){
                if(newNode.content !== oldNode.content){
                    return false;
                }
            }
            // 以上情况都认为是不同节点
            return true;
        }
        let update = (oldNode, newNode) => {
            // type,props,children
            // #text content
            // 新旧节点不一样，完全渲染
            if(isSameNode(oldNode, newNode)){
                newNode[RENDER_TO_DOM](oldNode._range)
                return;
            }
            newNode._range = oldNode._range;

            let newChildren = newNode.vchildren;
            let oldChildren = oldNode.vchildren;

            if(!newChildren || !newChildren.length){
                return;
            }

            let tailRange = oldChildren[oldChildren.length-1]._range;

            for(let i=0; i<newChildren.length; i++){
                let newChild = newChildren[i];
                let oldChild = oldChildren[i];
                if(i < oldChildren.length){
                    update(oldChild, newChild);
                }else{
                    let range = document.createRange();
                    // 这是个空range，start和end一样
                    range.setStart(tailRange.endContainer, tailRange.endOffset);
                    range.setEnd(tailRange.endContainer, tailRange.endOffset);
                    newChild[RENDER_TO_DOM](range);
                    tailRange = range;
                }
            }

        }

        let vdom = this.vdom; //新vdom
        update(this._vdom, vdom);
        this._vdom = vdom; //替换旧vdom
    }
    setState(newState){
        // typeof 判断值是否为 object时，要先判断值是否为null，因为typeof null等于object
        if(this.state === null || typeof this.state !== "object"){
            this.state = newState;
            this.rerender();
            return;
        }
        let merge = (oldState, newState) => {
            for(let p in newState){
                if(oldState[p] === null || typeof oldState[p] !== "object"){
                    oldState[p] = newState[p];
                }else{
                    merge(oldState[p], newState[p])
                }
            }
        }
        merge(this.state, newState);
        this.update();
    }
}

class ElementWrapper extends Component{
    constructor(type){
        super(type);
        this.type = type;
    }
    // 创建虚拟DOM的方法
    get vdom(){
        this.vchildren = this.children.map(child => child.vdom);
        return this;
    }
    [RENDER_TO_DOM](range){
        this._range = range;

        range.deleteContents();
        // 建立root
        let root = document.createElement(this.type);
        for(let name in this.props){
            let value = this.props[name];
            if(name.match(/^on([\s\S]+)$/)) {  //绑定事件
                //on后面加了(),RegExp.$1 匹配捕获到的值
                root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
            }else { //设置属性
                // 如果style没有生效，可能是className没有转为class
                if(name === 'className'){
                    root.setAttribute('class', value)
                }else{
                    root.setAttribute(name, value);
                }
                
            }
        }
        if(!this.vchildren){
            this.vchildren = this.children.map(child => child.vdom);
        }
        for(let child of this.vchildren){
            let childRange = document.createRange();
            childRange.setStart(root, root.childNodes.length);
            childRange.setEnd(root, root.childNodes.length);
            child[RENDER_TO_DOM](childRange)
        }

        replaceContent(range, root);
    }  
}

class TextWrapper extends Component {
    constructor(content){
        super(content)
        this.type = "#text";
        this.content = content;
    }
    get vdom (){
        return this;
    }
    [RENDER_TO_DOM](range){
        this._range = range;
        let root = document.createTextNode(this.content);
        replaceContent(range, root);
    }
}

function replaceContent(range, node){
    range.insertNode(node);//插入后的node在range之后
    range.setStartAfter(node);//把range挪到node之后
    range.deleteContents();
    range.setStartBefore(node);
    range.setEndAfter(node);
}

export function createElement(type, attributes, ...children){
    // console.log(type, children);
    let e;
    if(typeof type === 'string'){
        e = new ElementWrapper(type);
    }else {
        e = new type;
    }
 
    for(let p in attributes){
        e.setAttribute(p, attributes[p]);
    }

    let insertChildren = (children) => {
        for(let child of children){
            if(typeof child === 'string'){
                child = new TextWrapper(child);
            }
            // 如果是null则不处理
            if(child === null){
                continue;
            }
            if(typeof child === "object" && child instanceof Array){
                insertChildren(child)
            }else {
                e.appendChild(child)
            }
            
        }
    }
    insertChildren(children)

    return e;

}

export function render(component, parentElement){
    let range = document.createRange();
    //range由Start节点和End节点组成的,0表示从从Element第一个children到最后一个children
    range.setStart(parentElement, 0);
    range.setEnd(parentElement, parentElement.childNodes.length);
    range.deleteContents();
    component[RENDER_TO_DOM](range);
}
