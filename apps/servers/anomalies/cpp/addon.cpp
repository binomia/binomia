#include <napi.h>
#include <algorithm>
#include <memory>
#include <vector>
#include "fraud_detection_rf.h" // Embedded JSON header generated via xxd
#include "json.hpp" // nlohmann/json.hpp

using json = nlohmann::json;

// --- Node structure ---
struct Node {
    bool leaf;
    int feature;
    double threshold;
    std::vector<double> probabilities;
    std::shared_ptr<Node> left;
    std::shared_ptr<Node> right;
};

// --- Recursively build tree from JSON ---
std::shared_ptr<Node> build_tree(const json& jnode) {
    auto node = std::make_shared<Node>();
    node->leaf = jnode.at("leaf").get<bool>();

    if (node->leaf) {
        node->probabilities = jnode.at("probabilities").get<std::vector<double>>();
    } else {
        node->feature = jnode.at("feature").get<int>();
        node->threshold = jnode.at("threshold").get<double>();
        node->left = build_tree(jnode.at("left"));
        node->right = build_tree(jnode.at("right"));
    }
    return node;
}

// --- Traverse a single tree ---
std::vector<double> predict_tree(const std::shared_ptr<Node>& node, const std::vector<double>& x) {
    if (node->leaf)
        return node->probabilities;
    if (x[node->feature] < node->threshold)
        return predict_tree(node->left, x);
    else
        return predict_tree(node->right, x);
}

// --- Predict with the entire forest ---
std::vector<double> predict_forest(const std::vector<std::shared_ptr<Node>>& forest, const std::vector<double>& x) {
    size_t num_classes = 0;
    for (auto& tree : forest) {
        auto n = tree;
        while (!n->leaf)
            n = n->left;
        num_classes = n->probabilities.size();
        break;
    }

    std::vector<double> avg_prob(num_classes, 0.0);
    for (const auto& tree : forest) {
        auto prob = predict_tree(tree, x);
        for (size_t i = 0; i < prob.size(); ++i)
            avg_prob[i] += prob[i];
    }
    for (auto& p : avg_prob)
        p /= forest.size();
    return avg_prob;
}

// --- Global forest loaded once ---
std::vector<std::shared_ptr<Node>> GLOBAL_FOREST;

// --- Load embedded forest ---
void LoadEmbeddedForest() {
    json jforest = json::parse(reinterpret_cast<const char*>(fraud_detection_rf_json), reinterpret_cast<const char*>(fraud_detection_rf_json + fraud_detection_rf_json_len));

    GLOBAL_FOREST.clear();
    for (const auto& jtree : jforest) {
        GLOBAL_FOREST.push_back(build_tree(jtree));
    }
}

// --- N-API wrapper ---
Napi::Object PredictTransaction(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsArray()) {
        Napi::TypeError::New(env, "Expected an array of features").ThrowAsJavaScriptException();
        return Napi::Object::New(env);
    }

    Napi::Array arr = info[0].As<Napi::Array>();
    std::vector<double> sample_tx(arr.Length());
    for (size_t i = 0; i < arr.Length(); i++) {
        sample_tx[i] = arr.Get(i).As<Napi::Number>().DoubleValue();
    }

    auto prob = predict_forest(GLOBAL_FOREST, sample_tx);
    double prob_valid = prob[0];
    double prob_fraud = prob[1];

    Napi::Object result = Napi::Object::New(env);
    result.Set("valid", prob_valid);
    result.Set("fraud", prob_fraud);

    return result;
}

// --- Module initialization ---
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    try {
        LoadEmbeddedForest(); // Load from embedded header
    } catch (const std::exception& e) {
        Napi::Error::New(env, std::string("Failed to load embedded forest: ") + e.what()).ThrowAsJavaScriptException();
    }

    exports.Set("predictTransaction", Napi::Function::New(env, PredictTransaction));
    return exports;
}

NODE_API_MODULE(forest_predictor, Init)
