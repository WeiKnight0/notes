export default {
  "route": "Computer-Organization",
  "title": "计算机组成原理",
  "date": "2026-09-02T00:00:00",
  "label": "COMPUTER ORGANIZATION",
  "description": "数据表示、存储系统、指令与处理器，理解硬件的运行机制。",
  "art": "chip",
  "color": "#aa8052",
  "tags": [
    "Computer Organization",
    408
  ],
  "groups": [
    {
      "id": "基础与数据",
      "title": "基础与数据",
      "art": "chip",
      "entries": [
        {
          "title": "计算机系统概述",
          "route": "Computer-Organization/01-system-overview"
        },
        {
          "title": "数据表示",
          "route": "Computer-Organization/02-data-representation"
        },
        {
          "title": "定点数运算",
          "route": "Computer-Organization/03-integer-arithmetic"
        },
        {
          "title": "浮点运算与运算器",
          "route": "Computer-Organization/04-floating-point-and-alu"
        }
      ]
    },
    {
      "id": "存储与指令",
      "title": "存储与指令",
      "art": "chip",
      "entries": [
        {
          "title": "主存储器",
          "route": "Computer-Organization/05-main-memory"
        },
        {
          "title": "高速缓冲存储器",
          "route": "Computer-Organization/06-cache"
        },
        {
          "title": "虚拟存储器",
          "route": "Computer-Organization/07-virtual-memory"
        },
        {
          "title": "指令系统",
          "route": "Computer-Organization/08-instruction-set"
        }
      ]
    },
    {
      "id": "中央处理器",
      "title": "中央处理器",
      "art": "chip",
      "entries": [
        {
          "title": "指令执行与数据通路",
          "route": "Computer-Organization/09-execution-and-datapath"
        },
        {
          "title": "控制器",
          "route": "Computer-Organization/10-control-unit"
        },
        {
          "title": "异常与中断",
          "route": "Computer-Organization/11-exceptions-and-interrupts"
        },
        {
          "title": "指令流水线与多处理器",
          "route": "Computer-Organization/12-pipeline-and-multicore"
        }
      ]
    },
    {
      "id": "总线与输入输出",
      "title": "总线与输入输出",
      "art": "chip",
      "entries": [
        {
          "title": "系统总线",
          "route": "Computer-Organization/13-system-bus"
        },
        {
          "title": "输入输出系统与接口",
          "route": "Computer-Organization/14-io-system-and-interface"
        },
        {
          "title": "I/O 控制方式与 DMA",
          "route": "Computer-Organization/15-io-control-and-dma"
        }
      ]
    },
    {
      "id": "来源与许可",
      "title": "来源与许可",
      "art": "chip",
      "html": "<p>本组笔记以 408 考试主线重新整理，并参考 <a href=\"https://github.com/Destinnnnn/Note/tree/672b98a\">Destinnnnn/Note（固定版本 672b98a）</a> 中的计算机组成原理笔记及其引用的湖南科技大学课程。选用的原图来自该仓库，许可见 <a href=\"{{base}}Computer-Organization/SOURCE-LICENSE.txt\">SOURCE-LICENSE.txt</a>。</p>"
    }
  ]
};
