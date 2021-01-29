import React, {FC, useEffect, useMemo, useRef, useState} from "react";
import "./index.less";
import Shape, {ShapeType} from "./shape";

interface RussiaBlockProps {
    canvasSizeW: number; // 画布宽度，高度自动计算
}

const RussiaBlock: FC<RussiaBlockProps> = (props) => {
    const {canvasSizeW: sizew} = props; // 水平宽度(px)
    const [cellCountW] = useState<number>(40); // 水平方向的cell数量
    const [cellCountH] = useState<number>(60); // 竖直方向的cell数量
    const [cellStatus, setCellStatus] = useState<number[][]>([]); // 记录cell的状态
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [curShape, setCurShape] = useState<Shape>(); // 当前block
    const [shapeLtX, setShapeLtX] = useState<number>(18); // 当前block的位置X
    const [shapeLtY, setShapeLtY] = useState<number>(-4); // 当前block的位置Y
    const cellSize = useMemo(() => {
        return sizew / cellCountW;
    }, [sizew, cellCountW]);

    // 绘制shape
    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            const ltx = shapeLtX * cellSize;
            const lty = shapeLtY * cellSize;
            curShape?.draw(ctx, ltx , lty, cellSize);
        }
    }, [shapeLtX, shapeLtY, curShape]);

    // 绘制已固定的block
    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current!.clientWidth, canvasRef.current!.clientHeight);
            for (let i = 0 ; i < cellStatus.length; i++) {
                for (let j = 0; j < cellStatus.length; j++) {

                }
            }
        }
    }, [cellStatus]);

    useEffect(() => {
        const status: number[][] = [];
        for (let i = 0; i < cellCountH; i++) {
            const curRowStatus: number[] = [];
            for (let j = 0; j < cellCountW; j++) {
                curRowStatus.push(0);
            }
            status.push(curRowStatus);
        }
        setCellStatus(status);
    }, []);

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



    return (
        <div className="russia">
            <canvas className="canvas" ref={canvasRef} />
        </div>
    );
};

export default RussiaBlock;
