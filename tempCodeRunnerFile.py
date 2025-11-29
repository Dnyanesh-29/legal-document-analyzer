import random
import time
import matplotlib.pyplot as plt

# Merge Sort
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Quick Sort
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr)//2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

# Performance Comparison
sizes = [100, 500, 1000, 5000, 10000]
merge_times, quick_times = [], []

for size in sizes:
    data = [random.randint(1,10000) for _ in range(size)]

    start = time.time()
    merge_sort(data)
    merge_times.append(time.time() - start)

    start = time.time()
    quick_sort(data)
    quick_times.append(time.time() - start)

# Plot Results
plt.plot(sizes, merge_times, label="Merge Sort", marker="o")
plt.plot(sizes, quick_times, label="Quick Sort", marker="o")
plt.xlabel("Input Size")
plt.ylabel("Running Time (seconds)")
plt.title("Merge Sort vs Quick Sort Performance")
plt.legend()
plt.grid(True)
plt.show()