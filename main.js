import { createElement, Component, render } from './toy-react3.js'

// tic-tac-toe最终版
class Square extends Component {
    render(){
        return (
            <button className="square" onClick={this.props.onClick}>
                {this.props.value}
            </button>
        );
    }
    
}

class Board extends Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null)
                }
            ],
            stepNumber: 0,
            xIsNext: true
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        this.setState({
            history: history.concat([
                {
                    squares: squares
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move :
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

render(<Game />, document.getElementById("root"));

// let game = <Game/>;
// console.log(game.vdom)

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}



// tic-tac-toe中间版本
// class Square extends Component {
//     // TODO: remove the constructor
//     constructor(props) {
//         super(props);
//         this.state = {
//             value: null,
//         };
//     }

//     render() {
//         // TODO: use onClick={this.props.onClick}
//         // TODO: replace this.state.value with this.props.value
//         return (
//             <button className="square" onClick={() => this.setState({ value: 'X' })}>
//                 {this.state.value}
//             </button>
//         );
//     }
// }

// class Board extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             squares: Array(9).fill(null),
//         };
//     }

//     renderSquare(i) {
//         return <Square value={this.state.squares[i]} />;
//     }

//     render() {
//         const status = 'Next player: X';

//         return (
//             <div>
//                 <div className="status">{status}</div>
//                 <div className="board-row">
//                     {this.renderSquare(0)}{this.renderSquare(1)}{this.renderSquare(2)}
//                 </div>
//                 <div className="board-row">
//                     {this.renderSquare(3)}{this.renderSquare(4)}{this.renderSquare(5)}
//                 </div>
//                 <div className="board-row">
//                     {this.renderSquare(6)}{this.renderSquare(7)}{this.renderSquare(8)}
//                 </div>
//             </div>
//         );
//     }
// }

// class Game extends Component {
//     render() {
//         return (
//             <div className="game">
//                 <div className="game-board">
//                     <Board />
//                 </div>
//                 <div className="game-info">
//                     <div>{/* status */}</div>
//                     <ol>{/* TODO */}</ol>
//                 </div>
//             </div>
//         );
//     }
// }

// render(
//     <Game />,
//     document.getElementById('root')
// );



// 基于range的DOM绘制、DOM的重新绘制、setState
// class MyComponent extends Component {
//     constructor(){
//         super();    //可以调用Component的构造函数
//         this.state = {
//             a: 1,
//             b: 2
//         }
//     }
//     render(){    
//         return <div>
//             <h1>my component</h1>
//             {/* <button onclick={()=>{ this.state.a++; this.rerender(); }}>add</button> */}
//             <button onclick={()=>{ this.setState({a: this.state.a+1}) }}>add</button>
//             <div>{this.state.a.toString()}</div>
//             <div>{this.state.b.toString()}</div>
//             {this.children}
//         </div>
//     }
// }



// render(<MyComponent id="a" class="b">
//         <div id="1">789</div>
//         <div id="2"></div>
//         <div id="3"></div>
//     </MyComponent >, document.body)



