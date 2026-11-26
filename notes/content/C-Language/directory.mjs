export default {
  "route": "C-Language",
  "title": "C 语言",
  "date": "2026-08-27",
  "label": "C PROGRAMMING",
  "description": "类型、指针、内存与程序组织，结合代码掌握 C 语言基础。",
  "art": "code",
  "color": "#5f83ad",
  "tags": [
    "C",
    "Programming",
    "Exam"
  ],
  "groups": [
    {
      "id": "c-language-c语言",
      "title": "C Language C语言",
      "art": "code",
      "html": "<p>本笔记以传统 C90 可编译写法为默认。</p>\n<blockquote>\n<p>C99、C11、C23 中新增的功能会单独标出。考试或编译环境没有明确允许时，不要默认使用。</p>\n</blockquote>"
    },
    {
      "id": "c语言核心",
      "title": "C语言核心",
      "art": "code",
      "entries": [
        {
          "title": "程序、类型、作用域与存储期",
          "route": "C-Language/01-program-types-and-storage"
        },
        {
          "title": "运算符、表达式与类型转换",
          "route": "C-Language/02-expressions-and-conversions"
        },
        {
          "title": "选择、循环与流程控制",
          "route": "C-Language/03-control-flow"
        },
        {
          "title": "数组与字符串",
          "route": "C-Language/04-arrays-and-strings"
        },
        {
          "title": "指针",
          "route": "C-Language/05-pointers"
        },
        {
          "title": "函数、递归与预处理",
          "route": "C-Language/06-functions-and-preprocessing"
        },
        {
          "title": "结构体、共用体、枚举与自定义类型",
          "route": "C-Language/07-aggregate-types"
        },
        {
          "title": "动态内存、标准库与文件",
          "route": "C-Language/08-library-memory-and-files"
        }
      ]
    },
    {
      "id": "考试复习",
      "title": "考试复习",
      "art": "code",
      "entries": [
        {
          "title": "易错点、程序跟踪与答题方法",
          "route": "C-Language/09-exam-pitfalls-and-tracing"
        },
        {
          "title": "NCRE公共基础知识速览",
          "route": "C-Language/10-ncre-public-basics"
        }
      ]
    },
    {
      "id": "参考文献",
      "title": "参考文献",
      "art": "code",
      "html": "<ul>\n<li>考试范围以<a href=\"https://ncre.neea.edu.cn/html1/report/2412/185-1.htm\">中国教育考试网：二级C语言程序设计考试大纲（2025年版）</a>为骨架。</li>\n<li>语言规则以<a href=\"https://www.open-std.org/jtc1/sc22/wg14/\">ISO/IEC JTC1/SC22/WG14</a>发布的 C 标准为准；查阅具体语法和标准库时可使用<a href=\"https://en.cppreference.com/w/c/\">C reference</a>。</li>\n<li>这不是 C++ 笔记：没有引用、类、函数重载、<code>new</code>/<code>delete</code>、<code>bool</code>、命名空间或 <code>std::string</code>。</li>\n</ul>"
    }
  ]
};
