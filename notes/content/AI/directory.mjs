import cs224n from './CS224N/directory.mjs';

export default {
  "route": "AI",
  "title": "人工智能",
  "date": "2026-09-10T00:00:00",
  "label": "ARTIFICIAL INTELLIGENCE",
  "description": "机器学习基础、神经网络、语言模型、多模态与强化学习。",
  "art": "neural",
  "color": "#77885c",
  "tags": [],
  "groups": [
    {
      "id": "机器学习基础",
      "title": "机器学习基础",
      "art": "neural",
      "entries": [
        {
          "title": "机器学习理论",
          "route": "AI/machine-learning-theory"
        },
        {
          "title": "学习范式",
          "route": "AI/learning-paradigms"
        },
        {
          "title": "线性回归与分类",
          "route": "AI/linear-models"
        }
      ]
    },
    {
      "id": "神经网络",
      "title": "神经网络",
      "art": "neural",
      "entries": [
        {
          "title": "神经网络基础与训练机制",
          "route": "AI/neural-network-fundamentals"
        },
        {
          "title": "卷积网络与视觉模型",
          "route": "AI/vision-models"
        },
        {
          "title": "循环网络与序列建模",
          "route": "AI/recurrent-networks-and-seq2seq"
        },
        {
          "title": "Attention 与 Transformer",
          "route": "AI/attention-and-transformer"
        }
      ]
    },
    cs224n,
    {
      "id": "多模态学习",
      "title": "多模态学习",
      "art": "neural",
      "entries": [
        {
          "title": "多模态任务与评价",
          "route": "AI/multimodal-tasks-and-evaluation"
        },
        {
          "title": "CLIP 与图文对齐",
          "route": "AI/clip"
        },
        {
          "title": "图文融合与视觉语言模型",
          "route": "AI/vision-language-models"
        }
      ]
    },
    {
      "id": "强化学习",
      "title": "强化学习",
      "art": "neural",
      "entries": [
        {
          "title": "强化学习基础",
          "route": "AI/reinforcement-learning-fundamentals"
        },
        {
          "title": "多臂老虎机",
          "route": "AI/multi-armed-bandits"
        },
        {
          "title": "价值估计与表格型控制",
          "route": "AI/value-estimation-and-tabular-control"
        },
        {
          "title": "DQN",
          "route": "AI/dqn"
        },
        {
          "title": "策略梯度与 Actor–Critic",
          "route": "AI/policy-gradient-and-actor-critic"
        }
      ]
    },
    {
      "id": "工具与项目",
      "title": "工具与项目",
      "art": "neural",
      "entries": [
        {
          "title": "NumPy 与 PyTorch",
          "route": "AI/numpy-and-pytorch"
        },
        {
          "title": "CLIP 图文检索实践",
          "route": "AI/clip-retrieval-project"
        },
        {
          "title": "视觉语言模型微调实践",
          "route": "AI/vlm-finetuning-project"
        }
      ]
    },
    {
      "id": "阅读路线",
      "title": "阅读路线",
      "art": "neural",
      "html": "<ul>\n<li><strong>共同基础</strong>：机器学习理论 → 线性回归与分类 → 神经网络基础与训练机制；NumPy 与 PyTorch 可配合模型实现阅读。</li>\n<li><strong>语言模型</strong>：循环网络与序列建模 → Attention 与 Transformer → CS224N 各讲笔记。</li>\n<li><strong>多模态</strong>：卷积网络与视觉模型、Attention 与 Transformer → 学习范式中的对比学习 → CLIP 与图文对齐 → 图文融合与视觉语言模型；结合多模态任务与评价及项目实践。</li>\n<li><strong>强化学习</strong>：强化学习基础 → 多臂老虎机 → 价值估计与表格型控制 → DQN → 策略梯度与 Actor–Critic。</li>\n</ul>"
    }
  ]
};
