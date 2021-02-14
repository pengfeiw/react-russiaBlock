import React, {FC, useEffect, useMemo, useRef, useState} from "react";
import Preview from "./preview";
import "./index.less";
import Shape, {ShapeType, shape} from "./shape";
import {Statistic, Button} from "antd";
import {PauseOutlined, ArrowUpOutlined, ArrowDownOutlined, ArrowLeftOutlined, ArrowRightOutlined} from "@ant-design/icons";
interface RussiaBlockProps {
    canvasSizeW: number; // 画布宽度，高度自动计算
}

// 检测两块区域是否冲突，用于碰撞检测
const isConflict = (blockValue1: number, blockValue2: number): boolean => {
    return (blockValue1 & blockValue2) !== 0;
};

// 随机下落block
const getRandomBlock = () => {
    const colors = ["#FFA488", "#66FF66", "#00FFFF", "#FF00FF", "#CCBBFF", "#FF3333"];
    const colorKey = Math.round(Math.random() * (colors.length - 1));
    const shapeTypeKeys = Object.keys(shape);
    const shapeTypeIndex = Math.round(Math.random() * (shapeTypeKeys.length - 1));
    const shapeValueIndex = Math.round(Math.random() * 3);
    const newShape = new Shape(shapeTypeKeys[shapeTypeIndex] as ShapeType);
    newShape.shapeIndex = shapeValueIndex;
    newShape.color = colors[colorKey];
    return newShape;
};

type GameStatus = "UNSTART" | "RUNNING" | "PAUSE" | "END"; // 游戏状态

const RussiaBlock: FC<RussiaBlockProps> = (props) => {
    const {canvasSizeW: sizew} = props; // 水平宽度(px)
    const [cellCountW] = useState<number>(20); // 水平方向的cell数量
    const [cellCountH] = useState<number>(30); // 竖直方向的cell数量
    const [cellStatus, setCellStatus] = useState<number[][]>([]); // 记录cell的状态
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [curShape, setCurShape] = useState<Shape>(); // 当前block
    const [nextShape, setNextShape] = useState<Shape>(); // 下一个block
    const [shapeLtX, setShapeLtX] = useState<number>(9); // 当前block的位置X
    const [shapeLtY, setShapeLtY] = useState<number>(-4); // 当前block的位置Y
    const preShapeLtxRef = useRef<number>(9); // 用于记录block上一个位置的X
    const preShapeLtyRef = useRef<number>(-4); // 用于记录block上一个位置的Y
    const [speed, setSpeed] = useState<number>(500); // 表示多长时间（ms）下落一格
    const [gameStatus, setGameStatus] = useState<GameStatus>("UNSTART"); // 游戏状态
    const [score, setScore] = useState<number>(0); // 分数，一个格子10分

    useEffect(() => {
        preShapeLtxRef.current = shapeLtX;
        preShapeLtyRef.current = shapeLtY;
    });

    const preLtx = preShapeLtxRef.current;
    const preLty = preShapeLtyRef.current;

    const cellSize = useMemo(() => {
        return sizew / cellCountW;
    }, [sizew, cellCountW]);

    // 获取一个blockValue
    const getBlockValueByLt = (ltX: number, ltY: number) => {
        if (ltY < -3) {
            return 0x0000;
        }
        if (ltX < -3 || ltX > cellCountW - 1 || ltY > cellCountH - 1) {
            return 0xFFFF;
        }
        let binaryStr = "";
        for (let i = ltY; i < ltY + 4; i++) {
            for (let j = ltX; j < ltX + 4; j++) {
                if (i >= 0 && i < cellStatus.length && j >= 0 && j < cellStatus[i].length) {
                    binaryStr += cellStatus[i][j];
                } else if (i < 0) {
                    binaryStr += "0";
                }
                else {
                    binaryStr += "1";
                }
            }
        }
        return parseInt(binaryStr, 2);
    };

    const updateCellStatusByShapeBlock = (shapeLtx: number, shapeLtY: number): void => {
        const newCellStatus: number[][] = JSON.parse(JSON.stringify(cellStatus));
        let shapeValue = curShape!.shapeValue;
        for (let i = shapeLtY; i < shapeLtY + 4; i++) {
            for (let j = shapeLtx; j < shapeLtx + 4; j++) {
                if (i >= 0 && i < newCellStatus.length && j >= 0 && j < newCellStatus[i].length) {
                    if (newCellStatus[i][j] === 0) {
                        newCellStatus[i][j] = (shapeValue & 0x8000) === 0 ? 0 : 1;
                    }
                }
                shapeValue <<= 1;
            }
        }
        setCellStatus(newCellStatus);
    };

    // 设置下一个block
    useEffect(() => {
        const block = getRandomBlock();
        setCurShape(block);
        setShapeLtX(9);
        setShapeLtY(-4);
        setNextShape(getRandomBlock());
    }, []);

    // 检测下落冲突，更新cellStatus
    useEffect(() => {
        if (curShape) {
            const blockValue = getBlockValueByLt(shapeLtX, shapeLtY);
            const conflict = isConflict(blockValue, curShape!.shapeValue);
            if (conflict) {
                if (shapeLtY >= 0) {
                    // 更新cellStatus
                    updateCellStatusByShapeBlock(shapeLtX, shapeLtY - 1);
                    setCurShape(nextShape);
                    setShapeLtX(9);
                    setShapeLtY(-4);
                    setNextShape(getRandomBlock());
                } else {
                    // game over
                    setGameStatus("END");
                }
            }
        }
    }, [shapeLtY]);

    // 清除
    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            const ltx = preLtx * cellSize;
            const lty = preLty * cellSize;
            curShape?.clear(ctx, ltx, lty, cellSize);
        }
    }, [curShape, shapeLtY, shapeLtX]);

    // 重新绘制
    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx && curShape) {
            // 在重新绘制新的图块
            const ltx = shapeLtX * cellSize;
            const lty = shapeLtY * cellSize;
            const blockValue = getBlockValueByLt(shapeLtX, shapeLtY);
            const conflict = isConflict(curShape!.shapeValue, blockValue);
            if (!conflict) {
                curShape?.draw(ctx, ltx, lty, cellSize);
            }
        }
    }, [curShape, shapeLtX, shapeLtY]);

    // 控制下落
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (gameStatus === "RUNNING") {
                setShapeLtY(shapeLtY => shapeLtY + 1); // 这里必须传入一个函数,不能写成setShapeLtY(shapeLtY + 1)。因为会存在闭包的问题。
            }
        }, speed);
        return () => clearInterval(intervalId);
    }, [speed, gameStatus]);

    // 设置速度
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (gameStatus === "RUNNING" && speed >= 100) {
                setSpeed(speed - 1);
            }
        }, 1000);
        return () => clearInterval(intervalId);
    }, [gameStatus, speed]);

    // 绘制已固定的block
    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            ctx.clearRect(-1, -1, canvasRef.current!.width + 2, canvasRef.current!.height + 2);
            for (let i = 0; i < cellStatus.length; i++) {
                for (let j = 0; j < cellStatus.length; j++) {
                    if (cellStatus[i][j] === 1) {
                        const ltx = j * cellSize;
                        const lty = i * cellSize;
                        ctx.strokeStyle = "#2c2c2c";
                        ctx.fillStyle = "#d3d3d3";
                        ctx.strokeRect(ltx, lty, cellSize, cellSize);
                        ctx.fillRect(ltx + 1, lty + 1, cellSize - 2, cellSize - 2);
                    }
                }
            }
        }
    }, [cellStatus]);

    // 检测消除的row,加分
    useEffect(() => {
        const eliminateRowIndex: number[] = [];
        for (let i = 0; i < cellStatus.length; i++) {
            const curRow = cellStatus[i];
            const isEliminate = curRow.every((item) => item === 1);
            if (isEliminate) {
                eliminateRowIndex.push(i);
            }
        }

        if (eliminateRowIndex.length > 0) {
            // 闪烁效果
            const ctx = canvasRef.current?.getContext("2d");
            let isDraw = false;
            const interval = setInterval(() => {
                if (isDraw) {
                    for (let i = 0; i < eliminateRowIndex.length; i++) {
                        const rowIndex = eliminateRowIndex[i];
                        const curRow = cellStatus[rowIndex];
                        for (let j = 0; j < curRow.length; j++) {
                            const ltx = j * cellSize;
                            const lty = rowIndex * cellSize;
                            ctx!.strokeStyle = "#2c2c2c";
                            ctx!.fillStyle = "#d3d3d3";
                            ctx!.strokeRect(ltx, lty, cellSize, cellSize);
                            ctx!.fillRect(ltx + 1, lty + 1, cellSize - 2, cellSize - 2);
                        }
                    }
                } else {
                    for (let i = 0; i < eliminateRowIndex.length; i++) {
                        const rowIndex = eliminateRowIndex[i];
                        const ltx = 0;
                        const lty = rowIndex * cellSize;
                        ctx?.clearRect(ltx - 1, lty - 1, sizew + 2, cellSize + 2);
                    }
                }
                isDraw = !isDraw;
            }, 200)
            setTimeout(() => {
                clearInterval(interval);
                // 加分，更新cellStatus
                setScore(score + 5 * cellCountW * eliminateRowIndex.length);
                const newCellStatus: number[][] = JSON.parse(JSON.stringify(cellStatus));
                for (let i = eliminateRowIndex.length - 1; i >= 0; i--) {
                    const delRowIndex = eliminateRowIndex[i];
                    newCellStatus.splice(delRowIndex, 1);
                }
                for (let i = 0; i < eliminateRowIndex.length; i++) {
                    newCellStatus.unshift(new Array(cellCountW).fill(0));
                }
                setCellStatus(newCellStatus);
            }, 1000);
        }
    }, [cellStatus]);

    useEffect(() => {
        if (gameStatus === "UNSTART") {
            const status: number[][] = [];
            for (let i = 0; i < cellCountH; i++) {
                const curRowStatus: number[] = [];
                for (let j = 0; j < cellCountW; j++) {
                    curRowStatus.push(0);
                }
                status.push(curRowStatus);
            }
            setCellStatus(status);
        }
    }, [gameStatus]);

    // 设置canvas尺寸
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const hToW = cellCountH / cellCountW;
            canvas.style.width = `${sizew}px`;
            canvas.style.height = `${hToW * sizew}px`;
            canvas.width = sizew;
            canvas.height = hToW * sizew;
        }
    }, []);

    // test: 绘制所有图形
    useEffect(() => {
        return;
        const cellSize = sizew * 1 / cellCountW;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const shapes = ["shapeO", "shapeI", "shapeZ", "shapeS", "shapeL", "shapeJ", "shapeT"];
        for (let i = 0; i < 7; i++) {
            const shape = new Shape(shapes[i] as ShapeType);
            for (let j = 0; j < 4; j++) {
                shape.shapeIndex = j;
                const drawY = cellSize * (i + 1) + 4 * cellSize * i;
                const drawX = cellSize * (j + 1) + 4 * cellSize * j;
                shape.draw(ctx!, drawX, drawY, cellSize);
            }
        }
    }, []);

    // 监听键盘事件
    useEffect(() => {
        const onKeyPress = (event: KeyboardEvent): void => {
            if (gameStatus === "END") {
                return;
            }
            const ctx = canvasRef.current?.getContext("2d");
            const ltx = shapeLtX * cellSize;
            const lty = shapeLtY * cellSize;
            let blockValue: number;
            let conflict: boolean;
            switch (event.key) {
                case "ArrowLeft":
                    blockValue = getBlockValueByLt(shapeLtX - 1, shapeLtY);
                    conflict = isConflict(curShape!.shapeValue, blockValue);
                    if (!conflict) {
                        setShapeLtX(shapeLtX - 1);
                    }
                    break;
                case "ArrowRight":
                    blockValue = getBlockValueByLt(shapeLtX + 1, shapeLtY);
                    conflict = isConflict(curShape!.shapeValue, blockValue);
                    if (!conflict) {
                        setShapeLtX(shapeLtX + 1);
                    }
                    break;
                case "ArrowDown":
                    setShapeLtY(shapeLtY + 1);
                    break;
                case "ArrowUp":
                    const newShape = new Shape(curShape!.type, curShape!.color, curShape!.borderColor);
                    newShape.shapeIndex = (curShape!.shapeIndex + 1) % 4;
                    blockValue = getBlockValueByLt(shapeLtX, shapeLtY);
                    conflict = isConflict(newShape.shapeValue, blockValue);
                    if (!conflict) {
                        setCurShape(newShape);
                        curShape?.clear(ctx!, ltx, lty, cellSize);
                    }
                    break;
                case " ":
                    if (gameStatus === "RUNNING") {
                        setGameStatus("PAUSE");
                    } else if (gameStatus === "PAUSE") {
                        setGameStatus("RUNNING");
                    }
                    break;
                default:
                    break;
            }
        };
        window.addEventListener("keydown", onKeyPress);
        return () => window.removeEventListener("keydown", onKeyPress);
    }, [canvasRef.current, shapeLtX, shapeLtY, cellSize, gameStatus, curShape]);

    // 开始游戏
    const startGame = () => {
        setGameStatus("RUNNING");
    };
    const restartGame = () => {
        setGameStatus("UNSTART");
        setScore(0);
        setSpeed(500);
    };

    return (
        <div className="russia">
            <div className="canvasContainer">
                <canvas className="canvas" ref={canvasRef} />
                {
                    gameStatus === "PAUSE" ? (
                        <div className="pause" style={{left: sizew * 0.45, top: sizew * 0.5}}>
                            <PauseOutlined />
                            暂停
                        </div>
                    ) : <></>
                }
                {
                    gameStatus === "UNSTART" ? <Button className="start" style={{left: sizew * 0.45, top: sizew * 0.5}} onClick={startGame}>开始游戏</Button> : <></>
                }
                {
                    gameStatus === "END" ? (
                        <div className="end" style={{left: sizew * 0.42, top: sizew * 0.5}}>
                            游戏结束
                            <Button className="restartButton" onClick={restartGame}>重新开始</Button>
                        </div>
                    ) : <></>
                }
            </div>
            <div className="sider">
                <div className="preview">
                    <Preview shape={nextShape} />
                </div>
                <div className="score">
                    <Statistic title="score" value={score} />
                </div>
                <div className="operator">
                    <span className="title">操作指示</span>
                    <div className="operatorItem">
                        <ArrowUpOutlined className="operatorItem-key" />
                        <span className="operatorItem-explain">旋转</span>
                    </div>
                    <div className="operatorItem">
                        <ArrowLeftOutlined className="operatorItem-key" />
                        <span className="operatorItem-explain">左移</span>
                    </div>
                    <div className="operatorItem">
                        <ArrowRightOutlined className="operatorItem-key" />
                        <span className="operatorItem-explain">右移</span>
                    </div>
                    <div className="operatorItem">
                        <ArrowDownOutlined className="operatorItem-key" />
                        <span className="operatorItem-explain">加速</span>
                    </div>
                    <div className="operatorItem">
                        <span className="operatorItem-key">SPACE</span>
                        <span className="operatorItem-explain">暂停</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RussiaBlock;
