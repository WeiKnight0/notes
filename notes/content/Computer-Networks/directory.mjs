export default {
  "route": "Computer-Networks",
  "title": "计算机网络",
  "date": "2026-08-27",
  "label": "COMPUTER NETWORKS",
  "description": "从数据交换到应用协议，沿网络分层理解通信过程。",
  "art": "network",
  "color": "#468c8b",
  "tags": [],
  "groups": [
    {
      "id": "基础与分层",
      "title": "基础与分层",
      "art": "network",
      "entries": [
        {
          "title": "计算机网络概述：互联网结构与数据交换",
          "route": "Computer-Networks/01-overview-and-switching"
        },
        {
          "title": "网络体系结构：协议、分层与性能",
          "route": "Computer-Networks/02-network-architecture-and-performance"
        },
        {
          "title": "物理层：信号、编码与传输介质",
          "route": "Computer-Networks/03-physical-layer"
        },
        {
          "title": "数据链路层：成帧、差错控制与介质访问",
          "route": "Computer-Networks/04-data-link-layer-and-mac"
        },
        {
          "title": "局域网：以太网、VLAN 与 WLAN",
          "route": "Computer-Networks/05-local-area-networks"
        }
      ]
    },
    {
      "id": "网络层",
      "title": "网络层",
      "art": "network",
      "entries": [
        {
          "title": "网络层：IP 编址、子网划分与数据报",
          "route": "Computer-Networks/06-ip-addressing-and-network-layer"
        },
        {
          "title": "路由：路由算法、OSPF、BGP 与组播",
          "route": "Computer-Networks/07-routing-and-control-plane"
        },
        {
          "title": "路由器：ARP、分组转发与 ICMP",
          "route": "Computer-Networks/08-router-and-data-plane"
        }
      ]
    },
    {
      "id": "端到端与应用",
      "title": "端到端与应用",
      "art": "network",
      "entries": [
        {
          "title": "传输层：UDP、可靠传输与 TCP",
          "route": "Computer-Networks/09-transport-layer"
        },
        {
          "title": "应用层：DNS、HTTP 与电子邮件",
          "route": "Computer-Networks/10-application-layer"
        }
      ]
    }
  ]
};
