import joblib

# Load SVM feature list
svm_features = joblib.load("model_store/svm/features.pkl")

print("SVM required features:")
for f in svm_features:
    print("-", f)

print("\nTotal features:", len(svm_features))
