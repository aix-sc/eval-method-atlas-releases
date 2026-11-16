#!/usr/bin/env node
// Eval Method Atlas CLI — AIx{ } Project, Musashino University. Data: CC BY 4.0. Code: MIT.

// src/cli.mjs
import { writeFileSync as writeFileSync2 } from "node:fs";
import { dirname as dirname2 } from "node:path";
import { fileURLToPath } from "node:url";

// src/trait_terms.mjs
var TRAIT_TERMS = {
  // ---- データの形
  d_tabular: ["tabular", "table data", "spreadsheet", "csv", "structured data", "\u8868\u5F62\u5F0F", "\u30C6\u30FC\u30D6\u30EB\u30C7\u30FC\u30BF", "\u8868\u30C7\u30FC\u30BF"],
  d_image: ["image", "images", "photo", "pixel", "mri", "ct scan", "x-ray", "satellite", "remote sensing", "\u753B\u50CF", "\u5199\u771F", "\u533B\u7528\u753B\u50CF", "\u885B\u661F"],
  d_video: ["video", "videos", "frames", "clip", "\u52D5\u753B", "\u6620\u50CF"],
  d_text: ["text", "language", "sentence", "document", "corpus", "llm", "token", "\u30C6\u30AD\u30B9\u30C8", "\u6587\u7AE0", "\u8A00\u8A9E", "\u81EA\u7136\u8A00\u8A9E", "llm"],
  d_query_document: ["query", "retrieval", "search engine", "passage", "rag", "\u691C\u7D22", "\u30AF\u30A8\u30EA", "\u6587\u66F8\u691C\u7D22"],
  d_speech_audio: ["speech", "audio", "sound", "acoustic", "music", "speaker", "\u97F3\u58F0", "\u97F3\u97FF", "\u97F3\u697D", "\u8A71\u8005"],
  d_time_series: ["time series", "time-series", "sensor", "signal", "temporal", "eeg", "ecg", "telemetry", "iot", "\u6642\u7CFB\u5217", "\u30BB\u30F3\u30B5\u30FC", "\u30BB\u30F3\u30B5", "\u4FE1\u53F7", "\u5FC3\u96FB\u56F3", "\u8133\u6CE2"],
  d_event_sequences: ["event sequence", "clickstream", "session", "trajectory of events", "\u30A4\u30D9\u30F3\u30C8\u5217", "\u884C\u52D5\u7CFB\u5217", "\u30BB\u30C3\u30B7\u30E7\u30F3"],
  d_graph: ["graph", "network", "node", "edge", "gnn", "\u30B0\u30E9\u30D5", "\u30CD\u30C3\u30C8\u30EF\u30FC\u30AF", "\u30CE\u30FC\u30C9"],
  d_knowledge_graph: ["knowledge graph", "ontology", "triple", "entity", "\u77E5\u8B58\u30B0\u30E9\u30D5", "\u30AA\u30F3\u30C8\u30ED\u30B8\u30FC"],
  d_3d_pointcloud: ["point cloud", "lidar", "mesh", "3d", "depth", "nerf", "gaussian splatting", "\u70B9\u7FA4", "3\u6B21\u5143", "\u4E09\u6B21\u5143", "\u30E1\u30C3\u30B7\u30E5"],
  d_physical_field: ["pde", "fluid", "simulation field", "grid", "climate model", "weather field", "\u504F\u5FAE\u5206", "\u6D41\u4F53", "\u683C\u5B50"],
  d_interactive_env: ["environment", "agent", "reinforcement", "game", "simulator", "robot", "\u5F37\u5316\u5B66\u7FD2", "\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8", "\u74B0\u5883", "\u30B7\u30DF\u30E5\u30EC\u30FC\u30BF"],
  d_code: ["source code", "code", "program", "repository", "software", "\u30BD\u30FC\u30B9\u30B3\u30FC\u30C9", "\u30D7\u30ED\u30B0\u30E9\u30E0", "\u30B3\u30FC\u30C9"],
  d_molecule_bio: ["molecule", "protein", "dna", "rna", "genome", "chemical", "drug", "\u5206\u5B50", "\u30BF\u30F3\u30D1\u30AF\u8CEA", "\u30B2\u30CE\u30E0", "\u5316\u5408\u7269", "\u5275\u85AC"],
  d_geospatial: ["gps", "geospatial", "map", "location", "trajectory", "mobility", "spatial", "\u5730\u7406", "\u4F4D\u7F6E", "\u8ECC\u8DE1", "\u5730\u56F3", "\u79FB\u52D5"],
  d_interaction_logs: ["user-item", "click", "rating", "purchase", "log data", "implicit feedback", "recommendation", "\u884C\u52D5\u30ED\u30B0", "\u30AF\u30EA\u30C3\u30AF", "\u8CFC\u8CB7", "\u8A55\u4FA1\u5C65\u6B74"],
  d_relational_db: ["sql", "relational", "database", "join", "query optimizer", "dbms", "\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9", "\u30EA\u30EC\u30FC\u30B7\u30E7\u30CA\u30EB"],
  d_math_formal: ["theorem", "proof", "formal", "lean", "equation", "math", "\u6570\u5F0F", "\u5B9A\u7406", "\u8A3C\u660E", "\u6570\u5B66"],
  d_multimodal_vl: ["multimodal", "vision-language", "image-text", "vlm", "caption", "\u30DE\u30EB\u30C1\u30E2\u30FC\u30C0\u30EB", "\u753B\u50CF\u3068\u8A00\u8A9E", "\u753B\u50CF\u3068\u30C6\u30AD\u30B9\u30C8"],
  // ---- 課題
  t_classification: ["classify", "classification", "categorize", "detect whether", "diagnosis", "\u5206\u985E", "\u5224\u5225", "\u8B58\u5225", "\u8A3A\u65AD"],
  t_regression: ["regression", "estimate the value", "continuous value", "score prediction", "\u56DE\u5E30", "\u6570\u5024\u3092\u4E88\u6E2C", "\u9023\u7D9A\u5024"],
  t_forecasting: ["forecast", "forecasting", "predict future", "future", "ahead", "next day", "demand prediction", "\u4E88\u6E2C", "\u5C06\u6765", "\u5148\u306E", "\u4E88\u5831", "\u9700\u8981\u4E88\u6E2C", "\u6545\u969C\u4E88\u6E2C"],
  t_ranking_rec: ["ranking", "recommend", "recommendation", "retrieval", "search", "rerank", "\u63A8\u85A6", "\u30EC\u30B3\u30E1\u30F3\u30C9", "\u30E9\u30F3\u30AD\u30F3\u30B0", "\u691C\u7D22"],
  t_structured_prediction: ["ner", "named entity", "parsing", "information extraction", "sequence labeling", "relation extraction", "\u56FA\u6709\u8868\u73FE", "\u69CB\u6587\u89E3\u6790", "\u60C5\u5831\u62BD\u51FA"],
  t_matching: ["matching", "alignment", "entity resolution", "correspondence", "registration", "\u7167\u5408", "\u5BFE\u5FDC\u4ED8\u3051", "\u30DE\u30C3\u30C1\u30F3\u30B0"],
  t_detection_segmentation: ["detection", "segmentation", "tracking", "bounding box", "localization", "\u691C\u51FA", "\u9818\u57DF\u5206\u5272", "\u30BB\u30B0\u30E1\u30F3\u30C6\u30FC\u30B7\u30E7\u30F3", "\u8FFD\u8DE1"],
  t_text_generation: ["generate text", "text generation", "summarization", "translation", "dialogue", "chatbot", "answer generation", "\u6587\u7AE0\u751F\u6210", "\u8981\u7D04", "\u7FFB\u8A33", "\u5BFE\u8A71", "\u751F\u6210"],
  t_media_generation: ["image generation", "video generation", "text-to-image", "diffusion", "speech synthesis", "music generation", "\u753B\u50CF\u751F\u6210", "\u52D5\u753B\u751F\u6210", "\u97F3\u58F0\u5408\u6210"],
  t_data_generation: ["synthetic data", "data generation", "molecule generation", "graph generation", "tabular generation", "\u30C7\u30FC\u30BF\u751F\u6210", "\u5408\u6210\u30C7\u30FC\u30BF"],
  t_clustering_unsupervised: ["clustering", "cluster", "topic model", "discover structure", "segmentation of users", "\u30AF\u30E9\u30B9\u30BF\u30EA\u30F3\u30B0", "\u30AF\u30E9\u30B9\u30BF\u30FC", "\u69CB\u9020\u306E\u767A\u898B"],
  t_reasoning_qa: ["question answering", "reasoning", "qa", "math problem", "chain of thought", "\u8CEA\u554F\u5FDC\u7B54", "\u63A8\u8AD6"],
  t_decision_control: ["control", "policy", "planning", "decision", "navigation", "manipulation", "\u5236\u5FA1", "\u610F\u601D\u6C7A\u5B9A", "\u8A08\u753B", "\u65B9\u7B56"],
  t_optimization: ["optimization", "scheduling", "routing", "combinatorial", "solver", "\u6700\u9069\u5316", "\u30B9\u30B1\u30B8\u30E5\u30FC\u30EA\u30F3\u30B0", "\u7D44\u5408\u305B"],
  t_causal: ["causal", "treatment effect", "counterfactual", "uplift", "intervention", "\u56E0\u679C", "\u4ECB\u5165", "\u52B9\u679C\u691C\u8A3C", "\u53CD\u5B9F\u4EEE\u60F3"],
  t_estimation: ["estimation", "uncertainty", "confidence interval", "parameter estimation", "\u63A8\u5B9A", "\u4E0D\u78BA\u5B9F\u6027"],
  t_anomaly: ["anomaly", "outlier", "fault", "failure", "fraud", "intrusion", "\u7570\u5E38", "\u5916\u308C\u5024", "\u6545\u969C", "\u4E0D\u6B63"],
  t_simulation_surrogate: ["surrogate", "emulator", "physics simulation", "neural operator", "\u4EE3\u7406\u30E2\u30C7\u30EB", "\u7269\u7406\u30B7\u30DF\u30E5\u30EC\u30FC\u30B7\u30E7\u30F3"],
  t_data_management: ["query processing", "indexing", "transaction", "storage", "data cleaning", "\u30AF\u30A8\u30EA\u51E6\u7406", "\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9", "\u30C7\u30FC\u30BF\u7BA1\u7406"],
  // ---- 学習のしかた
  l_supervised: ["supervised", "labeled data", "annotated", "\u6559\u5E2B\u3042\u308A", "\u30E9\u30D9\u30EB\u4ED8\u304D"],
  l_self_supervised: ["self-supervised", "pretraining", "pre-training", "foundation model", "contrastive", "\u81EA\u5DF1\u6559\u5E2B\u3042\u308A", "\u4E8B\u524D\u5B66\u7FD2", "\u57FA\u76E4\u30E2\u30C7\u30EB"],
  l_unsupervised: ["unsupervised", "without labels", "clustering", "\u6559\u5E2B\u306A\u3057"],
  l_reinforcement: ["reinforcement learning", "reward", "rl", "policy gradient", "\u5F37\u5316\u5B66\u7FD2", "\u5831\u916C"],
  l_preference_alignment: ["rlhf", "dpo", "preference", "alignment", "reward model", "\u9078\u597D", "\u30A2\u30E9\u30A4\u30E1\u30F3\u30C8", "\u6574\u5408"],
  l_few_shot_icl: ["few-shot", "zero-shot", "prompt", "in-context", "prompting", "\u5C11\u6570\u4F8B", "\u30D7\u30ED\u30F3\u30D7\u30C8", "\u30BC\u30ED\u30B7\u30E7\u30C3\u30C8"],
  l_no_learning: ["rule-based", "heuristic", "algorithm", "no training", "\u898F\u5247", "\u30EB\u30FC\u30EB\u30D9\u30FC\u30B9", "\u30A2\u30EB\u30B4\u30EA\u30BA\u30E0"],
  // ---- 正解の性質
  g_objective: ["accuracy", "ground truth", "correct answer", "label", "\u6B63\u89E3", "\u6B63\u7B54"],
  g_subjective: ["quality", "human judgment", "preference", "subjective", "fluency", "creativity", "aesthetic", "\u4E3B\u89B3", "\u597D\u307F", "\u8CEA", "\u5370\u8C61", "\u6E80\u8DB3", "\u7F8E\u3057\u3055"],
  g_none: ["discover", "exploratory", "theory", "insight", "\u767A\u898B", "\u63A2\u7D22\u7684", "\u7406\u8AD6"],
  g_online: ["a/b test", "online", "deployment", "click-through", "conversion", "engagement", "\u5B9F\u904B\u7528", "\u30AA\u30F3\u30E9\u30A4\u30F3", "\u30AF\u30EA\u30C3\u30AF\u7387", "\u30B3\u30F3\u30D0\u30FC\u30B8\u30E7\u30F3"],
  // ---- 気をつける性質
  c_label_scarce: ["few labels", "label scarcity", "unlabeled", "weak supervision", "semi-supervised", "\u30E9\u30D9\u30EB\u304C\u5C11\u306A\u3044", "\u30E9\u30D9\u30EB\u306A\u3057", "\u5C11\u91CF\u306E\u30C7\u30FC\u30BF"],
  c_expert_needed: ["expert", "clinician", "radiologist", "lawyer", "domain knowledge", "\u5C02\u9580\u5BB6", "\u533B\u5E2B", "\u5C02\u9580\u77E5\u8B58"],
  c_label_noise: ["noisy label", "label noise", "annotation error", "\u30E9\u30D9\u30EB\u30CE\u30A4\u30BA", "\u8AA4\u30E9\u30D9\u30EB"],
  c_distribution_shift: ["distribution shift", "domain shift", "out-of-distribution", "ood", "domain adaptation", "generalization", "\u5206\u5E03\u306E\u5909\u5316", "\u5206\u5E03\u30B7\u30D5\u30C8", "\u30C9\u30E1\u30A4\u30F3"],
  c_nonstationary: ["drift", "non-stationary", "nonstationary", "concept drift", "seasonal", "over time", "trend", "\u5B63\u7BC0", "\u6642\u9593\u3068\u3068\u3082\u306B", "\u5909\u308F\u308B", "\u30C9\u30EA\u30D5\u30C8", "\u50BE\u5411\u304C\u5909\u308F\u308B"],
  c_imbalanced_longtail: ["imbalanced", "long-tail", "rare", "minority class", "class imbalance", "\u4E0D\u5747\u8861", "\u30ED\u30F3\u30B0\u30C6\u30FC\u30EB", "\u307E\u308C", "\u7A00"],
  c_large_scale: ["large-scale", "billion", "million", "web-scale", "big data", "\u5927\u898F\u6A21", "\u5927\u91CF"],
  c_small_sample: ["small sample", "small dataset", "few participants", "limited data", "\u6A19\u672C\u304C\u5C0F\u3055\u3044", "\u5C11\u6570", "\u5C0F\u898F\u6A21"],
  c_missing_data: ["missing", "incomplete", "irregular", "imputation", "\u6B20\u6E2C", "\u6B20\u640D", "\u4E0D\u898F\u5247"],
  c_confounding: ["observational", "confounding", "confounder", "bias", "selection bias", "\u89B3\u5BDF\u30C7\u30FC\u30BF", "\u4EA4\u7D61", "\u30D0\u30A4\u30A2\u30B9"],
  c_non_independent: ["repeated measures", "same subject", "longitudinal", "within-subject", "per user", "patients", "\u540C\u3058\u4EBA", "\u7E70\u308A\u8FD4\u3057", "\u7E26\u65AD", "\u88AB\u9A13\u8005\u5185", "\u60A3\u8005"],
  c_human_facing: ["user", "users", "participant", "interface", "assistant", "human", "\u5229\u7528\u8005", "\u30E6\u30FC\u30B6\u30FC", "\u53C2\u52A0\u8005", "\u4EBA\u304C\u4F7F\u3046"],
  c_high_stakes: ["safety-critical", "medical", "clinical", "autonomous driving", "legal", "financial risk", "\u5B89\u5168", "\u533B\u7642", "\u81EA\u52D5\u904B\u8EE2", "\u4EBA\u547D"],
  c_privacy_sensitive: ["privacy", "personal data", "differential privacy", "federated", "anonymization", "\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC", "\u500B\u4EBA\u60C5\u5831", "\u533F\u540D\u5316"],
  c_resource_constrained: ["edge device", "mobile", "latency", "real-time", "memory", "efficient", "low-resource", "\u30A8\u30C3\u30B8", "\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0", "\u8EFD\u91CF", "\u8A08\u7B97\u8CC7\u6E90"],
  c_adversarial: ["adversarial", "attack", "jailbreak", "poisoning", "robust to attack", "\u6575\u5BFE\u7684", "\u653B\u6483", "\u8106\u5F31\u6027"],
  c_multi_objective: ["trade-off", "multi-objective", "pareto", "balance between", "\u30C8\u30EC\u30FC\u30C9\u30AA\u30D5", "\u4E21\u7ACB", "\u591A\u76EE\u7684"],
  // ---- 分野
  f_nlp: ["nlp", "language model", "llm", "text", "\u81EA\u7136\u8A00\u8A9E\u51E6\u7406", "\u8A00\u8A9E\u30E2\u30C7\u30EB"],
  f_cv: ["computer vision", "image", "vision", "visual", "\u30B3\u30F3\u30D4\u30E5\u30FC\u30BF\u30D3\u30B8\u30E7\u30F3", "\u753B\u50CF\u8A8D\u8B58"],
  f_speech_audio: ["speech", "audio", "asr", "\u97F3\u58F0\u8A8D\u8B58", "\u97F3\u58F0"],
  f_ir_recsys: ["recommender", "information retrieval", "search", "\u63A8\u85A6\u30B7\u30B9\u30C6\u30E0", "\u60C5\u5831\u691C\u7D22"],
  f_data_mining: ["data mining", "pattern mining", "\u30C7\u30FC\u30BF\u30DE\u30A4\u30CB\u30F3\u30B0"],
  f_databases: ["database", "query", "sql", "\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9"],
  f_web_social: ["social media", "web", "twitter", "social network", "\u30BD\u30FC\u30B7\u30E3\u30EB", "sns", "\u30A6\u30A7\u30D6"],
  f_rl_agents: ["reinforcement learning", "agent", "llm agent", "\u5F37\u5316\u5B66\u7FD2", "\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8"],
  f_robotics: ["robot", "robotic", "manipulation", "locomotion", "\u30ED\u30DC\u30C3\u30C8"],
  f_theory: ["theorem", "bound", "convergence", "complexity", "\u7406\u8AD6", "\u53CE\u675F", "\u5B9A\u7406"],
  f_kr_reasoning: ["planning", "logic", "knowledge representation", "reasoning", "\u77E5\u8B58\u8868\u73FE", "\u8AD6\u7406", "\u30D7\u30E9\u30F3\u30CB\u30F3\u30B0"],
  f_multiagent_game: ["multi-agent", "game theory", "auction", "mechanism design", "\u30DE\u30EB\u30C1\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8", "\u30B2\u30FC\u30E0\u7406\u8AD6"],
  f_hci: ["user study", "interface", "interaction", "usability", "hci", "\u30E6\u30FC\u30B6\u30FC\u30B9\u30BF\u30C7\u30A3", "\u30A4\u30F3\u30BF\u30FC\u30D5\u30A7\u30FC\u30B9", "\u4F7F\u3044\u3084\u3059\u3055"],
  f_safety_fairness: ["fairness", "bias", "safety", "privacy", "toxicity", "\u516C\u5E73", "\u5B89\u5168\u6027", "\u504F\u308A"],
  // ---- 応用領域
  a_health: ["medical", "clinical", "patient", "hospital", "disease", "health", "ehr", "mimic", "\u533B\u7642", "\u60A3\u8005", "\u75C5\u9662", "\u5065\u5EB7", "\u8A3A\u7642", "\u75BE\u60A3"],
  a_life_science: ["biology", "protein", "drug", "chemistry", "genomics", "\u751F\u547D\u79D1\u5B66", "\u5275\u85AC", "\u5316\u5B66", "\u30B2\u30CE\u30E0"],
  a_natural_science: ["physics", "climate", "weather", "material", "astronomy", "earth", "\u7269\u7406", "\u6C17\u5019", "\u6C17\u8C61", "\u6750\u6599", "\u5929\u6587"],
  a_finance: ["finance", "stock", "market", "trading", "credit", "economic", "\u91D1\u878D", "\u682A\u4FA1", "\u5E02\u5834", "\u7D4C\u6E08"],
  a_education: ["education", "student", "learning analytics", "tutoring", "exam", "\u6559\u80B2", "\u5B66\u751F", "\u5B66\u7FD2\u8005", "\u8A66\u9A13"],
  a_law_government: ["legal", "law", "court", "policy", "government", "\u6CD5\u5F8B", "\u88C1\u5224", "\u884C\u653F", "\u653F\u7B56"],
  a_transport: ["traffic", "transport", "autonomous driving", "vehicle", "mobility", "\u4EA4\u901A", "\u81EA\u52D5\u904B\u8EE2", "\u8ECA\u4E21", "\u79FB\u52D5"],
  a_manufacturing_energy: ["manufacturing", "factory", "industrial", "energy", "power grid", "battery", "machine", "equipment", "\u88FD\u9020", "\u5DE5\u5834", "\u7523\u696D", "\u30A8\u30CD\u30EB\u30AE\u30FC", "\u96FB\u529B", "\u8A2D\u5099", "\u6A5F\u68B0"],
  a_retail_ads: ["e-commerce", "retail", "advertising", "ads", "shopping", "ec", "\u5C0F\u58F2", "\u5E83\u544A", "\u8CFC\u8CB7"],
  a_media_sports: ["music", "game", "sports", "movie", "entertainment", "media", "\u97F3\u697D", "\u30B2\u30FC\u30E0", "\u30B9\u30DD\u30FC\u30C4", "\u6620\u753B", "\u30A8\u30F3\u30BF\u30E1", "\u30E1\u30C7\u30A3\u30A2"],
  a_software_engineering: ["software engineering", "bug", "code review", "program repair", "testing", "\u30BD\u30D5\u30C8\u30A6\u30A7\u30A2\u5DE5\u5B66", "\u30D0\u30B0"],
  a_agriculture_environment: ["agriculture", "crop", "ecology", "environment", "wildlife", "pollution", "\u8FB2\u696D", "\u4F5C\u7269", "\u751F\u614B", "\u74B0\u5883", "\u6C5A\u67D3"]
};

// src/core.mjs
var VERSION = "0.1.0";
var DATA_URL = "https://github.com/aix-sc/eval-method-atlas-releases/releases/latest/download/atlas-data.json.gz";
var DB = null;
var isLoaded = () => !!DB;
function loadFromObject(obj) {
  DB = index(obj);
  return DB;
}
function index(d) {
  const T = d.taxonomy;
  const labels = new Map(T.labels.map((l) => [l.id, l]));
  const ids = d.label_ids;
  const cols = d.paper_cols;
  const ci = Object.fromEntries(cols.map((c, i) => [c, i]));
  const papers = d.papers.map((r) => ({
    id: r[ci.id],
    title: r[ci.title],
    venue: r[ci.venue],
    year: r[ci.year],
    url: r[ci.url],
    doi: r[ci.doi],
    read_url: r[ci.read_url],
    labels: new Set(r[ci.labels].map((i) => ids[i])),
    datasets: r[ci.datasets],
    metrics: r[ci.metrics],
    tests: r[ci.tests],
    flags: r[ci.flags] || []
  }));
  const byId = new Map(papers.map((p) => [p.id, p]));
  const pc = Object.fromEntries(d.pair_cols.map((c, i) => [c, i]));
  const pairs = d.pairs.map((r) => ({
    trait: r[pc.trait],
    method: r[pc.method],
    n_trait: r[pc.n_trait],
    n_both: r[pc.n_both],
    p_method_given_trait: r[pc.p_method_given_trait],
    p_method: r[pc.p_method],
    lift: r[pc.lift],
    q: r[pc.q]
  }));
  const OUTCOME = /* @__PURE__ */ new Set(["method", "metric", "sense_eval"]);
  return { raw: d, T, labels, papers, byId, pairs, OUTCOME, fdr: d.fdr_q ?? 0.05 };
}
var db = () => {
  if (!DB) throw new Error("\u30C7\u30FC\u30BF\u304C\u8AAD\u307F\u8FBC\u307E\u308C\u3066\u3044\u307E\u305B\u3093");
  return DB;
};
function labelInfo(id) {
  const l = db().labels.get(id);
  if (!l) return { id, error: "\u4E0D\u660E\u306A ID" };
  const o = { id: l.id, axis: l.axis, ja: l.ja, en: l.en };
  if (l.axis === "method") {
    o.group = l.group;
    o.group_ja = db().T.method_groups[l.group]?.ja;
    if (l.desc_ja) o.desc_ja = l.desc_ja;
    if (l.pitfalls_ja) o.pitfalls_ja = l.pitfalls_ja;
  }
  return o;
}
function isTrait(id) {
  const l = db().labels.get(id);
  return !!l && !db().OUTCOME.has(l.axis);
}
function checkTraits(traits) {
  const bad = (traits || []).filter((x) => !isTrait(x));
  if (!traits?.length) throw new Error("\u7814\u7A76\u306E\u7279\u6027 ID \u3092 1 \u3064\u4EE5\u4E0A\u304F\u3060\u3055\u3044\uFF08find_traits \u3067\u63A2\u305B\u307E\u3059\uFF09");
  if (bad.length) throw new Error(`\u7814\u7A76\u306E\u7279\u6027 ID \u3067\u306F\u3042\u308A\u307E\u305B\u3093\uFF1A${bad.join(", ")}\uFF08find_traits \u3067\u63A2\u3057\u3066\u304F\u3060\u3055\u3044\uFF09`);
}
var judged = () => db().papers;
var withAll = (ids) => judged().filter((p) => ids.every((x) => p.labels.has(x)));
var round = (x, n = 3) => x == null ? null : Math.round(x * 10 ** n) / 10 ** n;
function paperOut(p) {
  return {
    id: p.id,
    title: p.title,
    venue: p.venue.toUpperCase(),
    year: p.year,
    doi: p.doi ? `https://doi.org/${p.doi}` : null,
    url: p.url,
    read_url: p.read_url
  };
}
function examplePapers(traits, method, k = 3, { venue, year } = {}) {
  let ps = withAll([...traits, ...method ? [method] : []]);
  if (venue) ps = ps.filter((p) => p.venue === String(venue).toLowerCase());
  if (year) ps = ps.filter((p) => p.year === Number(year));
  ps.sort((a, b) => b.year - a.year || (b.read_url ? 1 : 0) - (a.read_url ? 1 : 0) || a.id.localeCompare(b.id));
  const byV = /* @__PURE__ */ new Map();
  for (const p of ps) {
    if (!byV.has(p.venue)) byV.set(p.venue, []);
    byV.get(p.venue).push(p);
  }
  const out = [];
  const lists = [...byV.values()];
  for (let i = 0; out.length < k && lists.some((l) => l.length > i); i++) for (const l of lists) if (l[i] && out.length < k) out.push(l[i]);
  return out.map(paperOut);
}
function find_traits({ text, axes, traits_only = false, limit = 12 } = {}) {
  const q = String(text || "").trim().toLowerCase();
  if (!q) throw new Error("\u63A2\u3059\u8A00\u8449\u3092\u304F\u3060\u3055\u3044");
  const words = q.split(/[\s、,・/]+/).filter((w) => w.length >= 2);
  const hits = [];
  for (const l of db().labels.values()) {
    if (axes?.length && !axes.includes(l.axis)) continue;
    if (traits_only && db().OUTCOME.has(l.axis)) continue;
    const hay = [l.id, l.ja, l.en, l.desc_ja || ""].join(" ").toLowerCase();
    let s = 0;
    if ([l.id, l.ja.toLowerCase(), l.en.toLowerCase()].includes(q)) s += 10;
    if (hay.includes(q)) s += 4;
    for (const w of words) if (hay.includes(w)) s += 1;
    for (const part of l.ja.split(/[・、（）()\s]/).filter((x) => x.length >= 2)) if (q.includes(part.toLowerCase())) s += 2;
    if (s > 0) hits.push([s, l.id]);
  }
  hits.sort((a, b) => b[0] - a[0]);
  return hits.slice(0, limit).map(([s, id]) => ({
    ...labelInfo(id),
    axis_ja: db().T.axes[db().labels.get(id).axis]?.ja,
    score: s,
    is_trait: isTrait(id)
  }));
}
function suggest_traits({ text, per_axis = 3, min_score = 1 } = {}) {
  const raw = String(text || "");
  if (!raw.trim()) throw new Error("\u6587\u3092\u304F\u3060\u3055\u3044\uFF08\u30A2\u30A4\u30C7\u30A3\u30A2\u3084\u3001\u539F\u7A3F\u306E\u8981\u65E8\u30FB\u5E8F\u8AD6\uFF09");
  const low = raw.toLowerCase();
  const out = {};
  for (const [id, terms] of Object.entries(TRAIT_TERMS)) {
    const l = db().labels.get(id);
    if (!l) continue;
    let score = 0;
    const hit = [];
    for (const term of terms) {
      const t = term.toLowerCase();
      let n = 0;
      if (/^[\x00-\x7f]+$/.test(t)) {
        const re = new RegExp(`(?<![a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9])`, "g");
        n = (low.match(re) || []).length;
      } else {
        n = low.split(t).length - 1;
      }
      if (n) {
        score += Math.min(n, 3) * (t.length >= 6 ? 1.5 : 1);
        hit.push(term);
      }
    }
    if (score >= min_score) (out[l.axis] ||= []).push({ id, ja: l.ja, score: round(score, 1), matched: hit.slice(0, 5) });
  }
  const axes = {};
  for (const [a, xs] of Object.entries(out)) axes[a] = { ja: db().T.axes[a]?.ja || a, candidates: xs.sort((x, y) => y.score - x.score).slice(0, per_axis) };
  const picked = ["task", "data_structure", "constraint"].map((a) => axes[a]?.candidates?.[0]?.id).filter(Boolean);
  return {
    axes,
    suggested_traits: picked,
    note_ja: "\u8A9E\u306E\u4E00\u81F4\u306B\u3088\u308B\u5019\u88DC\u3067\u3059\u3002\u7814\u7A76\u306B\u5F53\u3066\u306F\u307E\u308B\u3082\u306E\u3092\u9078\u3073\u76F4\u3057\u3066\u304B\u3089 design_guide \u306B\u6E21\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u7279\u6027\u3092\u5897\u3084\u3059\u307B\u3069\u5F53\u3066\u306F\u307E\u308B\u8AD6\u6587\u306F\u6E1B\u308A\u307E\u3059\uFF082\u301C3 \u500B\u304C\u76EE\u5B89\uFF09\u3002"
  };
}
function list_taxonomy({ axis } = {}) {
  const T = db().T;
  const by = {};
  for (const l of T.labels) {
    if (axis && l.axis !== axis) continue;
    (by[l.axis] ||= []).push({ id: l.id, ja: l.ja, en: l.en, ...l.group ? { group: l.group } : {} });
  }
  const out = {
    axes: Object.fromEntries(Object.entries(by).map(([a, items]) => [a, { ja: T.axes[a]?.ja || a, items }])),
    method_groups: T.method_groups
  };
  if (!axis || axis === "stat_tests") out.stat_tests = Object.fromEntries(Object.entries(T.stat_tests).filter(([, v]) => (T.stat_groups[v.group]?.facet || "procedure") === "procedure").map(([k, v]) => [k, v.ja]));
  return out;
}
function matchedPriors(traits) {
  const ts = new Set(traits);
  return db().T.priors.filter((r) => {
    const any = r.when?.any || [];
    const all = r.when?.all || [];
    return any.length && any.some((x) => ts.has(x)) || all.length && all.every((x) => ts.has(x));
  });
}
function recommend_evaluation({ traits, top_k = 12, examples = 3 } = {}) {
  checkTraits(traits);
  const { pairs, fdr, raw } = db();
  const prior = {};
  for (const r of matchedPriors(traits)) for (const m of r.recommend) (prior[m] ||= []).push({ rule: r.id, rationale_ja: r.rationale_ja, caution_ja: r.caution_ja || "" });
  const ev = {};
  for (const p of pairs) if (traits.includes(p.trait)) (ev[p.method] ||= []).push(p);
  const joint = withAll(traits);
  const nj = joint.length;
  const jc = {};
  for (const p of joint) for (const l of p.labels) jc[l] = (jc[l] || 0) + 1;
  const share = raw.overall_share || {};
  const cands = new Set(Object.keys(prior));
  for (const [m, rows] of Object.entries(ev)) if (rows.some((x) => x.q <= fdr && x.lift > 1)) cands.add(m);
  if (nj >= 20) {
    for (const [m, c] of Object.entries(jc)) if (share[m] && c / nj > 1.3 * share[m]) cands.add(m);
  }
  const items = [];
  for (const m of cands) {
    if (db().labels.get(m)?.axis !== "method") continue;
    const rows = ev[m] || [];
    const sig = rows.filter((x) => x.q <= fdr && x.lift > 1);
    const mll = rows.length ? rows.reduce((s, x) => s + Math.log(x.lift), 0) / rows.length : 0;
    const score = (prior[m]?.length || 0) + 2 * Math.max(mll, 0) + 0.5 * sig.length;
    items.push({
      ...labelInfo(m),
      score: round(score),
      share_in_these_papers: nj ? round((jc[m] || 0) / nj) : null,
      share_overall: share[m] ?? null,
      prior: prior[m] || [],
      evidence: rows.map((x) => ({
        trait: x.trait,
        p_method_given_trait: round(x.p_method_given_trait),
        p_method: round(x.p_method),
        lift: round(x.lift, 2),
        q: x.q,
        n_both: x.n_both,
        n_trait: x.n_trait
      }))
    });
  }
  items.sort((a, b) => b.score - a.score);
  const top = items.slice(0, top_k);
  for (const it of top) it.example_papers = examplePapers(traits, it.id, examples);
  return {
    traits: traits.map(labelInfo),
    n_papers_with_all_traits: nj,
    n_judged: judged().length,
    recommendations: top,
    note_ja: "share \u306F\u540C\u3058\u7279\u6027\u3092\u6301\u3064\u63A1\u9332\u8AD6\u6587\uFF08T2\uFF09\u3067\u306E\u63A1\u7528\u7387\u3002prior \u306F\u8A55\u4FA1\u65B9\u6CD5\u8AD6\u306E\u52E7\u3081\uFF08T1\u30FBT3\uFF09\u3002\u63A1\u7528\u7387\u304C\u9AD8\u3044\u3053\u3068\u306F\u6B63\u3057\u3055\u306E\u6839\u62E0\u3067\u306F\u306A\u3044\u3002"
  };
}
function reference_papers({ traits, method, k = 10, venue, year } = {}) {
  checkTraits(traits);
  if (method && db().labels.get(method)?.axis !== "method" && db().labels.get(method)?.axis !== "metric") throw new Error(`\u8A55\u4FA1\u624B\u6CD5\u30FB\u6307\u6A19\u306E ID \u3067\u306F\u3042\u308A\u307E\u305B\u3093\uFF1A${method}`);
  const all = withAll([...traits, ...method ? [method] : []]);
  return {
    traits: traits.map(labelInfo),
    method: method ? labelInfo(method) : null,
    n_matching: all.length,
    papers: examplePapers(traits, method, k, { venue, year }),
    note_ja: "read_url \u306F\u516C\u958B\u7248\u306E PDF\uFF08arXiv\u30FBOpenReview\u30FBCVF \u306A\u3069\uFF09\u304B\u8AD6\u6587\u30DA\u30FC\u30B8\u3002\u30E9\u30D9\u30EB\u306F Jev \u306E\u5224\u5B9A\u3067\u3001\u8AA4\u308A\u3092\u542B\u307F\u3046\u308B\u306E\u3067\u672C\u6587\u3067\u78BA\u304B\u3081\u3066\u304F\u3060\u3055\u3044\u3002"
  };
}
function topCounter(list, k) {
  const c = /* @__PURE__ */ new Map();
  for (const xs of list) for (const x of new Set(xs)) c.set(x, (c.get(x) || 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, k);
}
function design_guide({ traits, top = 15, min_share = 0.05 } = {}) {
  checkTraits(traits);
  const D = db();
  const joint = withAll(traits);
  const all = judged();
  const nj = joint.length;
  const na = all.length;
  const rec = recommend_evaluation({ traits, top_k: 12, examples: 3 });
  const recIds = new Set(rec.recommendations.map((r) => r.id));
  const shareOf = (ps, id) => ps.length ? ps.filter((p) => p.labels.has(id)).length / ps.length : 0;
  const lexJ = joint.filter((p) => p.datasets);
  const lexA = all.filter((p) => p.datasets);
  const cntA = (key) => {
    const m = /* @__PURE__ */ new Map();
    for (const p of lexA) for (const x of new Set(p[key])) m.set(x, (m.get(x) || 0) + 1);
    return m;
  };
  const dsA = cntA("datasets");
  const mnA = cntA("metrics");
  const datasets = topCounter(lexJ.map((p) => p.datasets), top).map(([name, n]) => ({ name, papers: n, share: round(n / lexJ.length), share_all: round((dsA.get(name) || 0) / lexA.length, 4) }));
  const metric_names = topCounter(lexJ.map((p) => p.metrics), top).map(([name, n]) => ({ name, papers: n, share: round(n / lexJ.length), share_all: round((mnA.get(name) || 0) / lexA.length, 4) }));
  const methods = D.T.labels.filter((l) => l.axis === "method").map((l) => ({ ...labelInfo(l.id), share: round(shareOf(joint, l.id)), share_all: round(shareOf(all, l.id)), recommended: recIds.has(l.id) })).filter((m) => m.share >= min_share || m.recommended).sort((a, b) => b.share - a.share);
  const metric_families = D.T.labels.filter((l) => l.axis === "metric").map((l) => ({ id: l.id, ja: l.ja, share: round(shareOf(joint, l.id)), share_all: round(shareOf(all, l.id)) })).filter((m) => m.share >= min_share).sort((a, b) => b.share - a.share);
  const ST = D.T.stat_tests;
  const SG = D.T.stat_groups;
  const proc = (t) => (SG[ST[t]?.group]?.facet || "procedure") === "procedure" && ST[t];
  const scJ = joint.filter((p) => p.tests);
  const scA = all.filter((p) => p.tests);
  const tA = /* @__PURE__ */ new Map();
  for (const p of scA) for (const t of p.tests) tA.set(t, (tA.get(t) || 0) + 1);
  const tests = topCounter(scJ.map((p) => p.tests.filter(proc)), top).map(([id, n]) => ({ id, ja: ST[id].ja, group_ja: SG[ST[id].group]?.ja, papers: n, share: round(n / scJ.length), share_all: round((tA.get(id) || 0) / scA.length, 4) }));
  const HYP = /* @__PURE__ */ new Set(["test_param", "test_nonpar", "test_cat"]);
  const hyp = (ps) => ps.length ? ps.filter((p) => p.tests.some((t) => proc(t) && HYP.has(ST[t].group))).length / ps.length : null;
  const none = scJ.length ? scJ.filter((p) => !p.tests.some(proc)).length / scJ.length : null;
  const ts = new Set(traits);
  const cautions = D.T.mismatch_rules.filter((r) => (r.label_any || []).some((x) => ts.has(x))).map((r) => ({
    id: r.id,
    ja: r.ja,
    why_ja: r.why_ja,
    suggest_ja: r.suggest_ja,
    basis: r.basis,
    basis_ja: r.basis_ja,
    refs: r.refs,
    flagged_papers: joint.filter((p) => p.flags.includes(r.id)).length
  }));
  const priors = matchedPriors(traits).map((r) => ({ id: r.id, rationale_ja: r.rationale_ja, caution_ja: r.caution_ja || "", recommend: r.recommend.map((m) => labelInfo(m).ja) }));
  return {
    traits: traits.map(labelInfo),
    n_papers_with_all_traits: nj,
    n_judged: na,
    small_sample: nj < 20,
    data: { n_extracted: lexJ.length, datasets },
    methods,
    metrics: { families: metric_families, names: metric_names },
    tests: { n_scanned: scJ.length, hypothesis_test_share: round(hyp(scJ)), hypothesis_test_share_all: round(hyp(scA)), no_procedure_share: round(none), items: tests },
    cautions,
    priors,
    examples: Object.fromEntries(rec.recommendations.map((r) => [r.id, r.example_papers]))
  };
}
function review_design({ traits, methods_used = [], tests_used = [] } = {}) {
  checkTraits(traits);
  const badT = tests_used.filter((x) => !db().T.stat_tests[x]);
  if (badT.length) throw new Error(`\u691C\u5B9A\u30FB\u691C\u8A3C\u624B\u6CD5\u306E ID \u3067\u306F\u3042\u308A\u307E\u305B\u3093\uFF1A${badT.join(", ")}\uFF08list_taxonomy \u306E stat_tests \u3092\u898B\u3066\u304F\u3060\u3055\u3044\u3002\u4F8B t_test_paired, wilcoxon, kfold_cv, holdout\uFF09`);
  const badM = methods_used.filter((x) => db().labels.get(x)?.axis !== "method");
  if (badM.length) throw new Error(`\u8A55\u4FA1\u624B\u6CD5\u306E ID \u3067\u306F\u3042\u308A\u307E\u305B\u3093\uFF1A${badM.join(", ")}`);
  const used = /* @__PURE__ */ new Set([...methods_used, ...tests_used]);
  const labs = /* @__PURE__ */ new Set([...traits, ...methods_used]);
  const rec = recommend_evaluation({ traits, top_k: 12, examples: 2 });
  const missing = rec.recommendations.filter((r) => !used.has(r.id) && (r.prior.length || (r.share_in_these_papers ?? 0) >= 0.2)).map((r) => ({ id: r.id, ja: r.ja, why: r.prior.map((p) => p.rationale_ja)[0] || `\u540C\u3058\u7279\u6027\u306E\u63A1\u9332\u8AD6\u6587\u306E ${Math.round((r.share_in_these_papers || 0) * 100)}% \u304C\u4F7F\u3063\u3066\u3044\u308B`, example_papers: r.example_papers }));
  const flags = [];
  for (const r of db().T.mismatch_rules) {
    const la = r.label_any || [];
    const ln = r.label_none || [];
    const any = r.any || [];
    const allx = r.all || [];
    const nonex = r.none || [];
    if (!any.length && !allx.length) continue;
    if (r.cue_any?.length || r.metric_any?.length || r.metric_none?.length) continue;
    if (la.length && !la.some((x) => labs.has(x))) continue;
    if (ln.some((x) => labs.has(x))) continue;
    if (any.length && !any.some((x) => used.has(x))) continue;
    if (allx.length && !allx.every((x) => used.has(x))) continue;
    if (nonex.some((x) => used.has(x))) continue;
    flags.push({ id: r.id, ja: r.ja, why_ja: r.why_ja, suggest_ja: r.suggest_ja, basis: r.basis, basis_ja: r.basis_ja, refs: r.refs });
  }
  return {
    traits: traits.map(labelInfo),
    missing_recommended: missing,
    mismatch_flags: flags,
    note_ja: "\u65D7\u306F\u300C\u8981\u78BA\u8A8D\u306E\u5019\u88DC\u300D\u3067\u3001\u8AA4\u308A\u306E\u65AD\u5B9A\u3067\u306F\u306A\u3044\u3002tests_used \u306F list_taxonomy \u306E stat_tests \u306E ID\uFF08\u4F8B random_split, paired_t_test\uFF09\u3002"
  };
}
function method_profile({ method_id } = {}) {
  const l = db().labels.get(method_id);
  if (!l || !["method", "metric"].includes(l.axis)) throw new Error(`\u8A55\u4FA1\u624B\u6CD5\u30FB\u6307\u6A19\u306E ID \u3067\u306F\u3042\u308A\u307E\u305B\u3093\uFF1A${method_id}`);
  const assoc = db().pairs.filter((p) => p.method === method_id && p.q <= db().fdr && p.lift > 1).sort((a, b) => b.lift - a.lift).slice(0, 12).map((p) => ({ trait: labelInfo(p.trait), lift: round(p.lift, 2), p_method_given_trait: round(p.p_method_given_trait), n_both: p.n_both }));
  const byYear = {};
  const byVenue = {};
  for (const p of judged()) {
    const h = p.labels.has(method_id) ? 1 : 0;
    (byYear[p.year] ||= [0, 0])[0] += h;
    byYear[p.year][1]++;
    (byVenue[p.venue] ||= [0, 0])[0] += h;
    byVenue[p.venue][1]++;
  }
  const sh = (o) => Object.entries(o).map(([k, [a, b]]) => ({ key: k, share: round(a / b), n: b }));
  return {
    ...labelInfo(method_id),
    share_overall: db().raw.overall_share?.[method_id] ?? null,
    share_by_year: sh(byYear),
    share_by_venue: sh(byVenue).sort((a, b) => b.share - a.share),
    associated_traits: assoc,
    prior_rules: db().T.priors.filter((r) => r.recommend.includes(method_id)).map((r) => r.id)
  };
}
function trait_profile({ trait_id } = {}) {
  checkTraits([trait_id]);
  const r = recommend_evaluation({ traits: [trait_id], top_k: 15, examples: 2 });
  return { ...labelInfo(trait_id), n_papers: r.n_papers_with_all_traits, recommendations: r.recommendations };
}
function search_papers({ query = "", venue, year, labels = [], limit = 20 } = {}) {
  const q = query.toLowerCase();
  let ps = judged();
  if (q) ps = ps.filter((p) => (p.title || "").toLowerCase().includes(q));
  if (venue) ps = ps.filter((p) => p.venue === String(venue).toLowerCase());
  if (year) ps = ps.filter((p) => p.year === Number(year));
  if (labels.length) ps = ps.filter((p) => labels.every((x) => p.labels.has(x)));
  return { n_matching: ps.length, papers: ps.slice(0, limit).map((p) => ({ ...paperOut(p), labels: [...p.labels] })) };
}
function get_paper({ paper_id } = {}) {
  const p = db().byId.get(paper_id);
  if (!p) throw new Error(`\u898B\u3064\u304B\u308A\u307E\u305B\u3093\uFF1A${paper_id}`);
  const by = {};
  for (const id of p.labels) {
    const l = db().labels.get(id);
    if (l) (by[l.axis] ||= []).push({ id, ja: l.ja });
  }
  return {
    ...paperOut(p),
    labels_by_axis: by,
    datasets: p.datasets,
    metric_names: p.metrics,
    tests: (p.tests || []).map((t) => ({ id: t, ja: db().T.stat_tests[t]?.ja || t })),
    mismatch_flags: p.flags
  };
}
function judge_questions({ axis } = {}) {
  const T = db().T;
  const labs = T.labels.filter((l) => !axis || l.axis === axis).map((l) => ({ id: l.id, axis: l.axis, ja: l.ja, en: l.en }));
  return {
    model: db().raw.judge?.model,
    thresholds: db().raw.judge?.thresholds,
    n: labs.length,
    labels: labs,
    note_ja: "\u554F\u3044\u306E\u539F\u6587\u3068\u5224\u5B9A\u306E\u57FA\u6E96\uFF08\u5F53\u3066\u306F\u307E\u308B\u30FB\u5F53\u3066\u306F\u307E\u3089\u306A\u3044\uFF09\u306E\u5168\u6587\u306F\u3001\u30A6\u30A7\u30D6\u30B5\u30A4\u30C8\u306E\u300C\u5224\u5B9A\u306E\u554F\u3044\u300D\u3068\u516C\u958B\u30C7\u30FC\u30BF\u306E questions.json \u306B\u3042\u308A\u307E\u3059\u3002"
  };
}
function corpus_status() {
  const d = db().raw;
  return { generated: d.generated, license: d.license, cite: d.cite, judge: d.judge, n_judged: judged().length, coverage: d.coverage };
}
var S = (props, required = []) => ({ type: "object", properties: props, required, additionalProperties: false });
var strArr = { type: "array", items: { type: "string" } };
var TOOLS = [
  {
    name: "find_traits",
    fn: find_traits,
    desc: "\u8A00\u8449\uFF08\u65E5\u672C\u8A9E\u30FB\u82F1\u8A9E\uFF09\u304B\u3089\u7814\u7A76\u306E\u7279\u6027\u30FB\u8A55\u4FA1\u624B\u6CD5\u306E ID \u3092\u63A2\u3059\u3002\u539F\u7A3F\u3084\u30A2\u30A4\u30C7\u30A3\u30A2\u3092\u8AAD\u3093\u3067\u3001\u5F53\u3066\u306F\u307E\u308B\u7279\u6027\u3092\u9078\u3076\u524D\u306B\u4F7F\u3046\u3002",
    schema: S({ text: { type: "string", description: "\u4F8B\u300C\u6642\u7CFB\u5217\u306E\u5C06\u6765\u4E88\u6E2C\u300D\u300Cuser study\u300D" }, traits_only: { type: "boolean" }, axes: strArr, limit: { type: "integer" } }, ["text"])
  },
  {
    name: "suggest_traits",
    fn: suggest_traits,
    desc: "\u539F\u7A3F\u30FB\u30A2\u30A4\u30C7\u30A3\u30A2\u306E\u6587\u304B\u3089\u7814\u7A76\u306E\u7279\u6027\u306E\u5019\u88DC\u3092\u6319\u3052\u308B\uFF08\u8A9E\u306E\u4E00\u81F4\u306B\u3088\u308B\u5019\u88DC\u3002Claude \u306F\u81EA\u5206\u3067\u8AAD\u3093\u3067\u9078\u3093\u3067\u3082\u3088\u3044\uFF09\u3002",
    schema: S({ text: { type: "string", description: "\u30A2\u30A4\u30C7\u30A3\u30A2\u3001\u307E\u305F\u306F\u539F\u7A3F\u306E\u8981\u65E8\u30FB\u5E8F\u8AD6\u306E\u6587" }, per_axis: { type: "integer" } }, ["text"])
  },
  {
    name: "design_guide",
    fn: design_guide,
    desc: "\u7814\u7A76\u306E\u7279\u6027 ID \u304B\u3089\u3001\u540C\u3058\u7279\u6027\u306E\u63A1\u9332\u8AD6\u6587\u304C\u4F7F\u3046\u30C7\u30FC\u30BF\u30FB\u5206\u3051\u65B9\u30FB\u6307\u6A19\u30FB\u691C\u5B9A\u3068\u3001\u6CE8\u610F\uFF08\u4E56\u96E2\u306E\u898F\u5247\u3068\u6839\u62E0\u306E\u6587\u732E\uFF09\u3001\u5B9F\u4F8B\u306E\u8AD6\u6587\u3092\u307E\u3068\u3081\u3066\u8FD4\u3059\u3002",
    schema: S({ traits: { ...strArr, description: '\u4F8B ["t_forecasting","d_time_series","c_nonstationary"]' } }, ["traits"])
  },
  {
    name: "recommend_evaluation",
    fn: recommend_evaluation,
    desc: "\u7814\u7A76\u306E\u7279\u6027 ID \u304B\u3089\u8A55\u4FA1\u624B\u6CD5\u3092\u63A8\u85A6\u3059\u308B\uFF08\u63A1\u9332\u8AD6\u6587\u3067\u306E\u63A1\u7528\u7387\u3068\u5C02\u9580\u77E5\u306E\u898F\u5247\uFF09\u3002",
    schema: S({ traits: strArr, top_k: { type: "integer" } }, ["traits"])
  },
  {
    name: "reference_papers",
    fn: reference_papers,
    desc: "\u6307\u5B9A\u306E\u7279\u6027\uFF08\u3068\u4EFB\u610F\u306E\u8A55\u4FA1\u624B\u6CD5\uFF09\u3092\u6301\u3064\u63A1\u9332\u8AD6\u6587\u3092\u3001DOI \u3068\u539F\u7A3F\u3092\u8AAD\u3081\u308B\u30EA\u30F3\u30AF\u3064\u304D\u3067\u8FD4\u3059\u3002\u30B1\u30FC\u30B9\u30B9\u30BF\u30C7\u30A3\u306E\u53C2\u8003\u306B\u4F7F\u3046\u3002",
    schema: S({ traits: strArr, method: { type: "string", description: "\u8A55\u4FA1\u624B\u6CD5\u30FB\u6307\u6A19\u306E ID\uFF08\u4EFB\u610F\uFF09" }, k: { type: "integer" }, venue: { type: "string" }, year: { type: "integer" } }, ["traits"])
  },
  {
    name: "review_design",
    fn: review_design,
    desc: "\u539F\u7A3F\u306E\u8A55\u4FA1\u306E\u8A2D\u8A08\u3092\u70B9\u691C\u3059\u308B\u3002\u7814\u7A76\u306E\u7279\u6027\u3068\u3001\u539F\u7A3F\u3067\u4F7F\u3063\u3066\u3044\u308B\u8A55\u4FA1\u624B\u6CD5\u30FB\u691C\u5B9A\u306E ID \u304B\u3089\u3001\u52E7\u3081\u306E\u629C\u3051\u3068\u4E56\u96E2\u306E\u898F\u5247\u306E\u5F53\u3066\u306F\u307E\u308A\u3092\u8FD4\u3059\u3002",
    schema: S({ traits: strArr, methods_used: strArr, tests_used: strArr }, ["traits"])
  },
  {
    name: "method_profile",
    fn: method_profile,
    desc: "\u8A55\u4FA1\u624B\u6CD5\u30FB\u6307\u6A19\u306E\u5B9A\u7FA9\u30FB\u843D\u3068\u3057\u7A74\u30FB\u5E74\u3054\u3068\u5B66\u4F1A\u3054\u3068\u306E\u63A1\u7528\u7387\u30FB\u7D50\u3073\u3064\u304D\u306E\u5F37\u3044\u7279\u6027\u3002",
    schema: S({ method_id: { type: "string" } }, ["method_id"])
  },
  { name: "trait_profile", fn: trait_profile, desc: "\u7814\u7A76\u306E\u7279\u6027\u306E\u8AD6\u6587\u6570\u3068\u3001\u305D\u306E\u7279\u6027\u306B\u9069\u3057\u305F\u8A55\u4FA1\u624B\u6CD5\u3002", schema: S({ trait_id: { type: "string" } }, ["trait_id"]) },
  {
    name: "search_papers",
    fn: search_papers,
    desc: "\u30BF\u30A4\u30C8\u30EB\u306E\u8A9E\u30FB\u5B66\u4F1A\u30FB\u5E74\u30FB\u30E9\u30D9\u30EB\uFF08\u3059\u3079\u3066\u3092\u6E80\u305F\u3059\uFF09\u3067\u63A1\u9332\u8AD6\u6587\u3092\u63A2\u3059\u3002",
    schema: S({ query: { type: "string" }, venue: { type: "string" }, year: { type: "integer" }, labels: strArr, limit: { type: "integer" } })
  },
  { name: "get_paper", fn: get_paper, desc: "\u8AD6\u6587 1 \u672C\u306E\u66F8\u8A8C\u30FB\u30EA\u30F3\u30AF\u30FB\u5224\u5B9A\u30E9\u30D9\u30EB\u30FB\u30C7\u30FC\u30BF\u30BB\u30C3\u30C8\u540D\u30FB\u6307\u6A19\u540D\u30FB\u691C\u5B9A\u30FB\u4E56\u96E2\u306E\u65D7\u3002", schema: S({ paper_id: { type: "string" } }, ["paper_id"]) },
  { name: "list_taxonomy", fn: list_taxonomy, desc: "\u5206\u985E\u4F53\u7CFB\u306E\u4E00\u89A7\uFF08\u7814\u7A76\u306E\u7279\u6027\u306E\u8EF8\u3068\u9805\u76EE\u3001\u8A55\u4FA1\u624B\u6CD5 46\u3001\u6307\u6A19\u306E\u65CF 26\u300110SM\uFF09\u3002", schema: S({ axis: { type: "string" } }) },
  { name: "judge_questions", fn: judge_questions, desc: "\u5224\u5B9A\u306B\u4F7F\u3063\u305F\u554F\u3044\u306E\u4E00\u89A7\u3068\u95BE\u5024\uFF08\u5224\u5B9A\u306E\u900F\u660E\u6027\u306E\u305F\u3081\uFF09\u3002", schema: S({ axis: { type: "string" } }) },
  { name: "corpus_status", fn: corpus_status, desc: "\u30C7\u30FC\u30BF\u306E\u7248\u30FB\u30E9\u30A4\u30BB\u30F3\u30B9\u30FB\u5B66\u4F1A \xD7 \u5E74\u306E\u5224\u5B9A\u4EF6\u6570\u3002", schema: S({}) }
];

// src/load.mjs
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
async function load({ here, refresh = false } = {}) {
  if (isLoaded() && !refresh) return;
  const cands = [process.env.ATLAS_DATA, here && join(here, "data", "atlas-data.json.gz"), here && join(here, "atlas-data.json.gz")].filter(Boolean);
  const cache = join(homedir(), ".eval-method-atlas", "atlas-data.json.gz");
  let buf = null;
  for (const p of cands) if (existsSync(p)) {
    buf = readFileSync(p);
    break;
  }
  if (!buf && existsSync(cache) && !refresh) buf = readFileSync(cache);
  if (!buf) {
    const url = process.env.ATLAS_DATA_URL || DATA_URL;
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) throw new Error(`\u30C7\u30FC\u30BF\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\uFF08${res.status}\uFF09\uFF1A${url}`);
    buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(dirname(cache), { recursive: true });
    writeFileSync(cache, buf);
  }
  loadFromObject(JSON.parse(gunzipSync(buf).toString("utf8")));
}

// src/markdown.mjs
var pct = (x) => x == null ? "\u2014" : `${Math.round(x * 100)}%`;
var pct1 = (x) => x == null ? "\u2014" : `${(x * 100).toFixed(1)}%`;
var ratio = (a, b) => b ? `${(a / b).toFixed(1)} \u500D` : "\u2014";
function guideMarkdown(g, labelInfo2) {
  const nj = g.n_papers_with_all_traits;
  const na = g.n_judged;
  const L = [
    `# \u8A55\u4FA1\u306E\u8A2D\u8A08\u30AC\u30A4\u30C9\uFF1A${g.traits.map((x) => x.ja).join("\u30FB")}`,
    "",
    `- \u7279\u6027\uFF1A${g.traits.map((x) => x.id).join(", ")}`,
    `- \u5BFE\u8C61\uFF1A\u5224\u5B9A\u6E08\u307F ${na.toLocaleString()} \u672C\u306E\u3046\u3061\u3001\u6307\u5B9A\u3057\u305F\u7279\u6027\u304C\u3059\u3079\u3066\u5F53\u3066\u306F\u307E\u308B **${nj.toLocaleString()} \u672C**\uFF08CORE A* \u306E\u63A1\u9332\u8AD6\u6587 2024\u301C2026\uFF09`,
    "- \u300C\u5168\u4F53\u300D\u306F\u5224\u5B9A\u6E08\u307F\u306E\u8AD6\u6587\u5168\u4F53\u3067\u306E\u5272\u5408\u3002\u300C\u4F55\u500D\u300D\u306F\u3001\u3053\u306E\u7279\u6027\u306E\u8AD6\u6587\u3067\u5168\u4F53\u3088\u308A\u4F55\u500D\u3088\u304F\u4F7F\u308F\u308C\u308B\u304B\u3002",
    "- \u30E9\u30D9\u30EB\u306F\u5224\u5B9A\u30E2\u30C7\u30EB\uFF08Jev\uFF09\u306E\u51FA\u529B\u3067\u3001\u8AA4\u308A\u3092\u542B\u307F\u3048\u307E\u3059\u3002\u5B9F\u4F8B\u306E\u8AD6\u6587\u306F\u672C\u6587\u3067\u78BA\u304B\u3081\u3066\u304F\u3060\u3055\u3044\u3002",
    ""
  ];
  if (g.small_sample) L.push(`> \u5F53\u3066\u306F\u307E\u308B\u8AD6\u6587\u304C ${nj} \u672C\u3068\u5C11\u306A\u3044\u305F\u3081\u3001\u5272\u5408\u306F\u4E0D\u5B89\u5B9A\u3067\u3059\u3002\u7279\u6027\u3092\u6E1B\u3089\u3059\u3068\u6BCD\u6570\u304C\u5897\u3048\u307E\u3059\u3002`, "");
  L.push(
    "## 1. \u3069\u3093\u306A\u30C7\u30FC\u30BF\u3092\u4F7F\u3063\u3066\u3044\u308B\u304B",
    "",
    `\u898F\u5247\u30D9\u30FC\u30B9\u306E\u62BD\u51FA\u3092\u6E08\u307E\u305B\u305F ${g.data.n_extracted.toLocaleString()} \u672C\u3067\u306E\u4E0A\u4F4D\uFF08\u8F9E\u66F8\u306B\u3042\u308B\u540D\u524D\u3060\u3051\uFF09\u3002`,
    "",
    "| \u30C7\u30FC\u30BF\u30BB\u30C3\u30C8 | \u8AD6\u6587\u6570 | \u5272\u5408 | \u5168\u4F53 |",
    "|---|---:|---:|---:|",
    ...g.data.datasets.map((d) => `| ${d.name} | ${d.papers} | ${pct(d.share)} | ${pct1(d.share_all)} |`)
  );
  L.push(
    "",
    "## 2. \u30C7\u30FC\u30BF\u306E\u5206\u3051\u65B9\u30FB\u5B9F\u9A13\u306E\u7D44\u307F\u65B9",
    "",
    "\u2605\uFF1D\u52E7\u3081\u308B\u624B\u6CD5\u3002",
    "",
    "| \u624B\u6CD5 | \u7FA4 | \u5272\u5408 | \u5168\u4F53 | \u4F55\u500D | \u843D\u3068\u3057\u7A74 |",
    "|---|---|---:|---:|---:|---|",
    ...g.methods.map((m) => `| ${m.recommended ? "\u2605 " : ""}${m.ja} | ${m.group_ja || ""} | ${pct(m.share)} | ${pct(m.share_all)} | ${ratio(m.share, m.share_all)} | ${m.pitfalls_ja || ""} |`)
  );
  L.push(
    "",
    "## 3. \u4F55\u3067\u6E2C\u3063\u3066\u3044\u308B\u304B\uFF08\u6307\u6A19\uFF09",
    "",
    "| \u6307\u6A19\u306E\u7A2E\u985E | \u5272\u5408 | \u5168\u4F53 | \u4F55\u500D |",
    "|---|---:|---:|---:|",
    ...g.metrics.families.map((m) => `| ${m.ja} | ${pct(m.share)} | ${pct(m.share_all)} | ${ratio(m.share, m.share_all)} |`),
    "",
    "| \u6307\u6A19\u540D | \u8AD6\u6587\u6570 | \u5272\u5408 | \u5168\u4F53 |",
    "|---|---:|---:|---:|",
    ...g.metrics.names.map((d) => `| ${d.name} | ${d.papers} | ${pct(d.share)} | ${pct1(d.share_all)} |`)
  );
  L.push(
    "",
    "## 4. \u3069\u3046\u78BA\u304B\u3081\u3066\u3044\u308B\u304B\uFF08\u7D71\u8A08\u7684\u691C\u5B9A\u30FB\u691C\u8A3C\u624B\u6CD5\uFF09",
    "",
    `\u672C\u6587\u3092\u8D70\u67FB\u3067\u304D\u305F ${g.tests.n_scanned.toLocaleString()} \u672C\u3067\u306E\u5272\u5408\u3002\u300Csignificantly\u300D\u306A\u3069\u306E\u8A00\u3044\u56DE\u3057\u306F\u6570\u3048\u306A\u3044\u3002`,
    ""
  );
  if (g.tests.hypothesis_test_share != null) L.push(`- \u4EEE\u8AAC\u691C\u5B9A\u30921\u3064\u3067\u3082\u4F7F\u3063\u3066\u3044\u308B\u8AD6\u6587\uFF1A**${pct(g.tests.hypothesis_test_share)}**\uFF08\u5168\u4F53 ${pct(g.tests.hypothesis_test_share_all)}\uFF09`, `- \u691C\u5B9A\u30FB\u691C\u8A3C\u306E\u624B\u7D9A\u304D\u304C1\u3064\u3082\u898B\u3064\u304B\u3089\u306A\u3044\u8AD6\u6587\uFF1A${pct(g.tests.no_procedure_share)}`, "");
  L.push(
    "| \u691C\u5B9A\u30FB\u691C\u8A3C\u624B\u6CD5 | \u7FA4 | \u8AD6\u6587\u6570 | \u5272\u5408 | \u5168\u4F53 |",
    "|---|---|---:|---:|---:|",
    ...g.tests.items.map((x) => `| ${x.ja} | ${x.group_ja || ""} | ${x.papers} | ${pct(x.share)} | ${pct1(x.share_all)} |`)
  );
  L.push("", "## 5. \u6CE8\u610F\u3059\u308B\u3053\u3068", "");
  for (const p of g.priors) L.push(`- **\u52E7\u3081\uFF08${p.id}\uFF09**\uFF1A${p.rationale_ja}${p.caution_ja ? ` \u6CE8\u610F\uFF1A${p.caution_ja}` : ""}`);
  for (const c of g.cautions) L.push(`- **\u4E56\u96E2\u306E\u898F\u5247 ${c.id}\uFF3B${c.basis}\uFF3D**\uFF1A${c.ja}\u3002${c.why_ja} \u2192 ${c.suggest_ja}\uFF08\u3053\u306E\u7279\u6027\u306E\u8AD6\u6587\u3067\u65D7\u304C\u7ACB\u3063\u305F\u306E\u306F ${c.flagged_papers} \u672C\uFF09  \u6839\u62E0\uFF1A${c.basis_ja}\uFF08${(c.refs || []).join("; ")}\uFF09`);
  L.push("", "## 6. \u5B9F\u4F8B\u306E\u8AD6\u6587\uFF08\u52E7\u3081\u308B\u624B\u6CD5\u3054\u3068\uFF09", "");
  for (const [mid, ps] of Object.entries(g.examples)) {
    if (!ps.length) continue;
    L.push(`**${labelInfo2(mid).ja}**`, ...ps.map((p) => `- ${p.title}\uFF08${p.venue} ${p.year}\uFF09 ${p.read_url || p.doi || p.url || ""}${p.doi && p.read_url !== p.doi ? `  DOI: ${p.doi}` : ""}`), "");
  }
  return L.join("\n");
}

// src/cli.mjs
var HERE = dirname2(fileURLToPath(import.meta.url));
var ME = "eval-method-atlas.mjs";
function help() {
  const rows = TOOLS.map((t) => `  ${t.name.replaceAll("_", "-").padEnd(22)} ${t.desc}`).join("\n");
  return `Eval Method Atlas CLI ${VERSION}
\u6700\u96E3\u95A2\u5B66\u4F1A\uFF08CORE A*\uFF09\u306E\u63A1\u9332\u8AD6\u6587\u304C\u3001\u3069\u306E\u30C7\u30FC\u30BF\u3067\u3001\u3069\u3046\u5206\u3051\u3001\u4F55\u3067\u6E2C\u308A\u3001\u3069\u3046\u78BA\u304B\u3081\u305F\u304B\u3092\u5F15\u304D\u307E\u3059\u3002

\u4F7F\u3044\u65B9\uFF1Anode ${ME} <command> [--\u5F15\u6570 \u5024 \u2026]

\u30B3\u30DE\u30F3\u30C9\uFF1A
${rows}

\u4F8B\uFF1A
  node ${ME} find-traits --text "\u6642\u7CFB\u5217\u306E\u5C06\u6765\u4E88\u6E2C"
  node ${ME} design-guide --traits t_forecasting,d_time_series,c_nonstationary --md --out guide.md
  node ${ME} reference-papers --traits t_forecasting,d_time_series --method temporal_split --k 10
  node ${ME} review-design --traits t_forecasting,d_time_series --tests-used random_split

\u5171\u901A\uFF1A--md\uFF08Markdown \u3067\u51FA\u3059\u3002design-guide\uFF09\u30FB--out <file>\uFF08\u30D5\u30A1\u30A4\u30EB\u306B\u66F8\u304F\uFF09\u30FB--refresh\uFF08\u30C7\u30FC\u30BF\u3092\u53D6\u308A\u76F4\u3059\uFF09
\u30C7\u30FC\u30BF\uFF1A\u521D\u56DE\u306B\u516C\u958B\u30C7\u30FC\u30BF\uFF08\u6570 MB\uFF09\u3092 ~/.eval-method-atlas \u306B\u53D6\u5F97\u3057\u307E\u3059\u3002ATLAS_DATA \u3067\u30D5\u30A1\u30A4\u30EB\u3092\u6307\u5B9A\u3067\u304D\u307E\u3059\u3002
\u5404\u30B3\u30DE\u30F3\u30C9\u306E\u5F15\u6570\uFF1Anode ${ME} <command> --help`;
}
function parse(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      out._.push(a);
      continue;
    }
    const k = a.slice(2).replaceAll("-", "_");
    const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    out[k] = v;
  }
  return out;
}
function coerce(tool, args) {
  const props = tool.schema.properties;
  const o = {};
  for (const [k, spec] of Object.entries(props)) {
    let v = args[k];
    if (v === void 0) continue;
    if (spec.type === "array") v = Array.isArray(v) ? v : String(v).trim().startsWith("[") ? JSON.parse(v) : String(v).split(",").map((x) => x.trim()).filter(Boolean);
    else if (spec.type === "integer") v = Number(v);
    else if (spec.type === "boolean") v = v === true || v === "true";
    o[k] = v;
  }
  if (args._.length) {
    if (props.traits && !o.traits) o.traits = args._;
    else if (props.text && !o.text) o.text = args._.join(" ");
    else if (props.method_id && !o.method_id) o.method_id = args._[0];
    else if (props.trait_id && !o.trait_id) o.trait_id = args._[0];
    else if (props.paper_id && !o.paper_id) o.paper_id = args._[0];
    else if (props.query && !o.query) o.query = args._.join(" ");
  }
  return o;
}
async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") {
    console.log(help());
    return;
  }
  if (cmd === "--version") {
    console.log(VERSION);
    return;
  }
  const tool = TOOLS.find((t) => t.name === cmd.replaceAll("-", "_"));
  if (!tool) {
    console.error(`\u4E0D\u660E\u306A\u30B3\u30DE\u30F3\u30C9\uFF1A${cmd}

${help()}`);
    process.exit(1);
  }
  const args = parse(rest);
  if (args.help) {
    const ps = Object.entries(tool.schema.properties).map(([k, s]) => `  --${k.replaceAll("_", "-")}  ${s.type}${(tool.schema.required || []).includes(k) ? "\uFF08\u5FC5\u9808\uFF09" : ""}${s.description ? "  " + s.description : ""}`);
    console.log(`${cmd}\uFF1A${tool.desc}
${ps.join("\n")}`);
    return;
  }
  await load({ here: HERE, refresh: !!args.refresh });
  const out = tool.fn(coerce(tool, args));
  const text = args.md && tool.name === "design_guide" ? guideMarkdown(out, labelInfo) : JSON.stringify(out, null, 2);
  if (args.out) {
    writeFileSync2(String(args.out), text + "\n");
    console.log(`\u66F8\u304D\u51FA\u3057\u307E\u3057\u305F\uFF1A${args.out}`);
  } else console.log(text);
}
main().catch((e) => {
  console.error(`\u30A8\u30E9\u30FC\uFF1A${e.message}`);
  process.exit(1);
});
