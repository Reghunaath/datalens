"""
DataLens — High-Level System Architecture (Mingrammer/diagrams)
Run:   python architecture_mingrammer.py
Output: datalens_architecture.svg  (open in any browser)
"""

import os
os.environ["GDFONTPATH"] = r"C:\Windows\Fonts"

from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import User
from diagrams.programming.framework import React, FastAPI
from diagrams.programming.language import Python
from diagrams.gcp.ml import VertexAI

GRAPH = {
    "compound": "true",
    "bgcolor": "#111318",
    "fontcolor": "#f1f5f9",
    "fontname": "arial",
    "fontsize": "20",
    "pad": "1.0",
    "splines": "ortho",
    "nodesep": "0.8",
    "ranksep": "1.8",
    "label": (
        "<<FONT COLOR='#f1f5f9' POINT-SIZE='22'><B>DataLens - System Architecture</B></FONT><BR/>"
        "<FONT COLOR='#94a3b8' POINT-SIZE='12'>"
        "React + FastAPI  |  Google Gemini  |  In-Memory Session"
        "</FONT>>"
    ),
    "labelloc": "t",
}

NODE = {
    "fontcolor": "#f1f5f9",
    "fontname": "arial",
    "fontsize": "13",
}

EDGE = {
    "color": "#64748b",
    "fontcolor": "#94a3b8",
    "fontname": "arial",
    "fontsize": "11",
}

def cluster_style(border, bg, label, margin="24"):
    return {
        "label": label,
        "bgcolor": bg,
        "fontcolor": "#f1f5f9",
        "fontname": "arial",
        "fontsize": "12",
        "style": "filled,rounded",
        "color": border,
        "penwidth": "2.5",
        "margin": margin,
    }

with Diagram(
    "",
    filename="datalens_architecture",
    outformat="svg",
    direction="LR",
    graph_attr=GRAPH,
    node_attr=NODE,
    edge_attr=EDGE,
    show=False,
):
    browser = User("User Browser")

    with Cluster("fe", graph_attr=cluster_style(
        "#1d4ed8", "#0f1a2e",
        "Frontend\nReact  TypeScript  Vite  Recharts\nlocalhost:5173"
    )):
        frontend = React("React App")

    with Cluster("be", graph_attr=cluster_style(
        "#065f46", "#0a1f18",
        "Backend  -  localhost:8000\nPython 3.11  |  FastAPI  |  uvicorn",
        margin="14",
    )):
        # Sandbox has NO external edges — keeps it in the same rank as FastAPI
        # so Graphviz stacks them vertically (same column, different rows)
        with Cluster("sbx", graph_attr=cluster_style(
            "#dc2626", "#1a0a0a",
            "exec() Sandbox\nrestricted  |  30s  |  retry",
            margin="12",
        )):
            sandbox = Python("Generated\nPython Code")
        backend = FastAPI("FastAPI")

    with Cluster("ext", graph_attr=cluster_style(
        "#b45309", "#1a1000",
        "External\nGoogle AI"
    )):
        gemini = VertexAI("Google Gemini\ngemini-3.1-pro-preview")

    # ── Edges ─────────────────────────────────────────────────────────────────
    browser >> Edge(
        xlabel="Upload CSV / Query",
        color="#135bec", fontcolor="#93c5fd", style="bold", penwidth="2",
        lhead="cluster_fe", minlen="3",
    ) >> frontend

    frontend >> Edge(
        xlabel="HTTP REST",
        color="#135bec", fontcolor="#93c5fd", style="bold", penwidth="2", minlen="2",
        ltail="cluster_fe", lhead="cluster_be",
    ) >> backend

    backend >> Edge(
        xlabel="JSON Response",
        color="#10b981", fontcolor="#6ee7b7", style="bold", penwidth="2",
        ltail="cluster_be", lhead="cluster_fe", constraint="false",
    ) >> frontend

    backend >> Edge(
        xlabel="Prompt + History",
        color="#f59e0b", fontcolor="#fcd34d", style="dotted", penwidth="1.5",
        ltail="cluster_be", lhead="cluster_ext", minlen="3",
    ) >> gemini

    gemini >> Edge(
        xlabel="Generated Python Code",
        color="#dc2626", fontcolor="#fca5a5", style="dotted", penwidth="1.5",
        ltail="cluster_ext", lhead="cluster_be", constraint="false",
    ) >> backend

print("Saved: datalens_architecture.svg")
