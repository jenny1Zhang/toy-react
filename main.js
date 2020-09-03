import { createElement, Component, render } from './toy-react.js'

class MyComponent extends Component {
    render(){    
        return <div>
            <h1>my component</h1>
            {this.children}
        </div>
    }
}



render(<MyComponent id="a" class="b">
        <div id="1">789</div>
        <div id="2"></div>
        <div id="3"></div>
    </MyComponent >, document.body)