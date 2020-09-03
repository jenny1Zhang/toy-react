////// 课程二
//实现基于range的DOM绘制、DOM的重新绘制、setState以及tic-tac-toe
//但这里，每次更改state，body下的根元素root也会更新

const RENDER_TO_DOM = Symbol('render to dom');

class ElementWrapper {
    constructor(type){
        this.root = document.createElement(type)
    }
    setAttribute(name, value){
        if(name.match(/^on([\s\S]+)$/)) {  //绑定事件
            //on后面加了(),RegExp.$1 匹配捕获到的值
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
        }else { //设置属性
            // 如果style没有生效，可能是className没有转为class
            if(name === 'className'){
                this.root.setAttribute('class', value)
            }else{
                this.root.setAttribute(name, value);
            }
            
        }
    }

    appendChild(component){
        let range = document.createRange();
        range.setStart(this.root, this.root.childNodes.length);
        range.setEnd(this.root, this.root.childNodes.length);
        component[RENDER_TO_DOM](range)
    }
    [RENDER_TO_DOM](range){
        //有root
        range.deleteContents();
        range.insertNode(this.root);
    }  
}

class TextWrapper {
    constructor(content){
        this.root = document.createTextNode(content)
    }
    [RENDER_TO_DOM](range){
        range.deleteContents();
        range.insertNode(this.root);
    }
}

export class Component {
    constructor(){
        this.props = Object.create(null) //空对象
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
    // _renderToDom(range){  //_代表私有
    //     this.render()._renderToDom(range);
    // }
    [RENDER_TO_DOM](range){
        this._range = range;
        this.render()[RENDER_TO_DOM](range);
    }
    // 重新绘制的算法
    rerender(){
        // 执行完deleteContents产生了一个全空的range,再插入range时，这个空的range会被包含到下一个(即相邻的)不空的range，所以插入时需要保证这个range是不空的
        // this._range.deleteContents();
        // this[RENDER_TO_DOM](this._range);
         
        // 创建新的range，把它放在oldRange的位置，
        let oldRange = this._range;
        let range = document.createRange();
        range.setStart(oldRange.startContainer, oldRange.startOffset);
        range.setEnd(oldRange.startContainer, oldRange.startOffset);
        this[RENDER_TO_DOM](range);
        // 插入完成之后，把oldRange的start挪到插入的内容之后，然后再把oldRange的所有内容删除
        oldRange.setStart(range.endContainer, range.endOffset);
        oldRange.deleteContents();
    }
    setState(newState){
        // typeof 判断值是否为 object时，要先判断值是否为null，因为typeof null等于object
        if(this.state === null || typeof this.state !== "object"){
            this.state = newState;
            this.rerender();
            return;
        }
        let merge = function(oldState, newState) {
            for(let p in newState){
                if(oldState[p] === null || typeof oldState[p] !== "object"){
                    oldState[p] = newState[p];
                }else{
                    merge(oldState[p], newState[p])
                }
            }
        }
        merge(this.state, newState);
        this.rerender();
    }
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
