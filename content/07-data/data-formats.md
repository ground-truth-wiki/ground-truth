---
id: data-formats
book: 7
order: "7.6"
title: Data formats for AI datasets
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [data-formats, jsonl, parquet, arrow, datasets]
visuals:
  - data-formats-row-vs-column:compare
  - data-formats-parquet-read:stepper
  - data-formats-scan-calculator:calculator
prerequisites: [data-strategy]
---
> [!tldr]
> Store records written one at a time (chat examples, eval cases, batch requests) as JSON Lines, and data you scan and filter as Parquet. Arrow is the in-memory columnar form tools share without copying, and large training runs add shard formats built for streaming. A format decides which bytes a reader must touch.

## Why it matters

Format choices show up as bills and outages. An eval script that needs one field still reads the whole JSON dump. A fine-tuning upload fails on one pretty-printed record. A vector index quietly mixes two embedding models. Choosing formats on purpose is part of your [data strategy](#data-strategy).

## Intuition

A row format is a stack of filled-in forms: adding one is easy, but totaling one field means leafing through every form. A columnar format is a cabinet with one drawer per field: totaling a field opens one drawer, but filing a record opens them all, so you file in batches.

```viz
{"id":"data-formats-row-vs-column","component":"compare","title":"Rows are cheap to append, columns are cheap to scan","caption":"Illustrative four-record table, stored both ways. Hover the marks.","alt":"Comparison of the same four records stored as JSON Lines rows and as columns. Computing the average score reads every record in the row layout but one column in the columnar layout; appending a record is one line in the row layout but touches every column in the columnar layout.","data":"illustrative","try":"Hover the two average-score lines, then the two append lines.","a":{"title":"Row layout: JSON Lines, CSV","text":"{\"id\":1,\"lang\":\"en\",\"score\":0.91,\"text\":\"Reset my…\"}\n{\"id\":2,\"lang\":\"de\",\"score\":0.42,\"text\":\"Wie kann…\"}\n{\"id\":3,\"lang\":\"en\",\"score\":0.77,\"text\":\"Invoice…\"}\n{\"id\":4,\"lang\":\"en\",\"score\":0.88,\"text\":\"Refund…\"}\n\navg(score): read all 4 records, every field\nadd record 5: append one line"},"b":{"title":"Columnar layout: Parquet, Arrow","text":"id     1     2     3     4\nlang   en    de    en    en\nscore  0.91  0.42  0.77  0.88\ntext   Reset my… | Wie kann… | Invoice… | Refund…\n\navg(score): read one column\nadd record 5: touch all four columns"},"links":[{"a":"\"score\":0.91","b":"score  0.91  0.42  0.77  0.88","note":"The same four numbers. On the left they sit between long text fields; on the right they are packed together, so a scan reads only them."},{"a":"avg(score): read all 4 records, every field","b":"avg(score): read one column","note":"Analytics, filtering and dataset statistics touch a few fields of many records: the columnar sweet spot."},{"a":"add record 5: append one line","b":"add record 5: touch all four columns","note":"Writing one record at a time favors rows. Columnar writers buffer many rows and write them together as a row group."},{"b":"lang   en    de    en    en","note":"Values in one column share a type and often repeat, so dictionary and run-length encodings shrink them well."}]}
```

AI data needs both. Records are born one at a time, in chat logs and API calls, and travel as rows. Analysis and training read many records but few fields, and want columns.

## How it works

**CSV.** [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180) admits that no formal specification exists. Every field is text, so readers guess types: [pandas](https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html) reads empty strings, “N/A” and “NULL” as missing by default. Quoted fields may hold line breaks, so line counts miscount records.

**JSON Lines.** [JSON Lines](https://jsonlines.org/) means UTF-8 without a byte order mark, one valid JSON value per line, each line ended by `\n`. JSON escapes control characters in strings ([RFC 8259](https://www.rfc-editor.org/rfc/rfc8259)), so a compact record never holds a raw newline. Files append, split and stream cleanly, and a corrupt line costs one record. Chat data is a `messages` list of role and content objects, as in [TRL](https://huggingface.co/docs/trl/dataset_formats) and, as of November 2026, the JSONL that [OpenAI’s fine-tuning guide](https://developers.openai.com/api/docs/guides/supervised-fine-tuning) requires ([fine-tuning in practice](#fine-tuning-practice), [eval datasets](#eval-datasets)). [OpenAI](https://developers.openai.com/api/docs/guides/batch) and [Anthropic](https://platform.claude.com/docs/en/build-with-claude/batch-processing) batch results are JSONL in any order, matched by `custom_id` ([model APIs](#model-apis)).

**Parquet.** A Parquet file splits rows into row groups. Each row group holds one column chunk per column, and each chunk is a series of pages, [compressed](https://parquet.apache.org/docs/file-format/data-pages/compression/) page by page and often [dictionary-encoded](https://parquet.apache.org/docs/file-format/data-pages/encodings/). The footer, written last, holds the schema, every chunk’s offset and optional min, max and null-count statistics ([parquet.thrift](https://github.com/apache/parquet-format/blob/master/src/main/thrift/parquet.thrift)). [Readers read it first](https://parquet.apache.org/docs/file-format/) and fetch only what they need:

```viz
{"id":"data-formats-parquet-read","component":"stepper","title":"A Parquet reader starts at the footer and reads only the chunks a query can use","caption":"Illustrative file with three row groups, written sorted by score, and the query SELECT lang, count(*) FROM logs WHERE score >= 0.8 GROUP BY lang. The statistics values are made up for the example.","alt":"Stepper over a Parquet file layout: magic number, three row groups with id, lang, score and text column chunks, footer with metadata, and footer length. The reader reads the tail, then the footer, skips row groups 0 and 1 by their score statistics, reads only the lang and score chunks of row group 2, and decodes their pages.","data":"illustrative","depicts":"Apache Parquet file format","try":"Pause on Prune and ask what the statistics would look like if the rows had been written in random order.","diagram":{"w":600,"h":300,"nodes":[
{"id":"head","label":"Magic number PAR1","role":"plain","align":"center","glyph":false,"x":0,"y":0,"w":600,"h":28},
{"id":"rg0","label":"Row group 0","role":"plain","glyph":false,"x":0,"y":40,"w":120,"h":44},
{"id":"c0i","label":"id","role":"data","align":"center","glyph":false,"x":130,"y":40,"w":110,"h":44},
{"id":"c0l","label":"lang","role":"data","align":"center","glyph":false,"x":248,"y":40,"w":110,"h":44},
{"id":"c0s","label":"score","role":"data","align":"center","glyph":false,"x":366,"y":40,"w":110,"h":44},
{"id":"c0t","label":"text","role":"data","align":"center","glyph":false,"x":484,"y":40,"w":110,"h":44},
{"id":"rg1","label":"Row group 1","role":"plain","glyph":false,"x":0,"y":96,"w":120,"h":44},
{"id":"c1i","label":"id","role":"data","align":"center","glyph":false,"x":130,"y":96,"w":110,"h":44},
{"id":"c1l","label":"lang","role":"data","align":"center","glyph":false,"x":248,"y":96,"w":110,"h":44},
{"id":"c1s","label":"score","role":"data","align":"center","glyph":false,"x":366,"y":96,"w":110,"h":44},
{"id":"c1t","label":"text","role":"data","align":"center","glyph":false,"x":484,"y":96,"w":110,"h":44},
{"id":"rg2","label":"Row group 2","role":"plain","glyph":false,"x":0,"y":152,"w":120,"h":44},
{"id":"c2i","label":"id","role":"data","align":"center","glyph":false,"x":130,"y":152,"w":110,"h":44},
{"id":"c2l","label":"lang","role":"data","align":"center","glyph":false,"x":248,"y":152,"w":110,"h":44},
{"id":"c2s","label":"score","role":"data","align":"center","glyph":false,"x":366,"y":152,"w":110,"h":44},
{"id":"c2t","label":"text","role":"data","align":"center","glyph":false,"x":484,"y":152,"w":110,"h":44},
{"id":"footer","label":"Footer: file metadata","sub":"schema, chunk offsets, statistics","role":"data","x":0,"y":208,"w":600,"h":48},
{"id":"tail","label":"Footer length (4 bytes) + PAR1","role":"plain","align":"center","glyph":false,"x":0,"y":268,"w":600,"h":28}]},
"frames":[
{"label":"Tail","highlight":["tail"],"caption":"The reader seeks to the end of the file. The last 8 bytes hold the footer length (4 bytes, little endian) and the magic number PAR1."},
{"label":"Footer","highlight":["footer"],"caption":"It reads the footer: the schema, where every column chunk starts, and optional statistics per chunk. No row data has been read yet.","code":"query: SELECT lang, count(*) FROM logs WHERE score >= 0.8 GROUP BY lang\n\nscore  row group 0: min 0.01  max 0.38\n       row group 1: min 0.38  max 0.71\n       row group 2: min 0.71  max 0.99"},
{"label":"Prune","highlight":["rg2","c2i","c2l","c2s","c2t"],"caption":"Predicate pushdown: only row group 2 has a maximum score of at least 0.8, so groups 0 and 1 are skipped without reading their data. This works because the file was written sorted by score."},
{"label":"Project","highlight":["rg2","c2l","c2s"],"caption":"Projection pushdown: in row group 2 the reader fetches only the lang and score chunks. The id chunk and the text chunk, the largest in a table like this, are never read."},
{"label":"Decode","highlight":["c2l","c2s"],"caption":"Each chunk is a series of pages, compressed one page at a time and often dictionary-encoded. The reader decompresses them into in-memory columns, then checks every row against the filter, because statistics only say a match is possible."},
{"label":"Write side","highlight":["rg0","rg1","rg2","footer"],"caption":"Writers do the reverse: buffer rows, write each row group, and write the footer last. That allows writing in a single pass, and it means a file is unreadable until its footer exists."}]}
```

Projection pushdown reads only the columns a query names; predicate pushdown skips row groups whose statistics rule out a match. The savings multiply:

```viz
{"id":"data-formats-scan-calculator","component":"calculator","title":"Projection and row-group skipping multiply: 3 of 40 columns from 5% of row groups reads under 0.4% of the data","caption":"Formula view with illustrative defaults: a 100 GiB dataset in 256 MiB row groups. Real columns differ in size, so read the result as an order of magnitude.","alt":"Calculator for the bytes a columnar scan reads, from dataset size, row group size, columns in the file, columns read and the share of row groups whose statistics match the filter.","data":"formula","try":"Set the matching share to 100 to see a filter on an unsorted column, where statistics skip nothing.","outputs":[{"id":"row_groups","label":"Row groups in the dataset","expr":"ceil(file_gib * 1024 / row_group_mib)","unit":"count"},{"id":"groups_read","label":"Row groups read","expr":"ceil(row_groups * match_pct / 100)","unit":"count"},{"id":"bytes_read","label":"Bytes read","expr":"file_gib * GiB * (columns_read / columns_total) * (groups_read / row_groups)","unit":"bytes","main":true},{"id":"share","label":"Share of the dataset read","expr":"bytes_read / (file_gib * GiB)","unit":"pct"}],"inputs":{"file_gib":100,"row_group_mib":256,"columns_total":40,"columns_read":3,"match_pct":5},"input_meta":{"file_gib":{"label":"Dataset size","unit":"GiB, compressed","min":1},"row_group_mib":{"label":"Row group size","unit":"MiB","min":1},"columns_total":{"label":"Columns in the file","min":1},"columns_read":{"label":"Columns the query reads","min":1},"match_pct":{"label":"Row groups whose statistics match the filter","unit":"%","min":0,"max":100}},"assumptions":["All columns have the same compressed size; in real data a text or image column can outweigh all the others together.","Statistics skip every row group without matching rows, which needs data sorted or clustered on the filter column.","The footer, page headers and per-request latency are ignored; on object storage, many small reads add their own cost."],"tests":[{"inputs":{},"expect":{"row_groups":400,"groups_read":20,"bytes_read":402653184,"share":0.00375}},{"inputs":{"columns_read":40,"match_pct":100},"expect":{"bytes_read":107374182400,"share":1}},{"inputs":{"row_group_mib":1024,"match_pct":1},"expect":{"row_groups":100,"groups_read":1}}]}
```

**Arrow.** The [Arrow columnar format](https://arrow.apache.org/docs/format/Columnar.html) is a language-agnostic in-memory layout with constant-time random access. Its buffers need no pointer rewriting, so they can be shared without copying: between processes through shared memory, or between libraries, as in the hand-offs [Hugging Face Datasets](https://huggingface.co/docs/datasets/about_arrow) makes to NumPy, pandas, PyTorch and TensorFlow. The IPC file format, which is also what [Feather V2](https://arrow.apache.org/docs/python/feather.html) files are on disk, can be [memory-mapped](https://arrow.apache.org/docs/python/ipc.html), so the operating system pages data in lazily, even beyond RAM. As the [Arrow FAQ](https://arrow.apache.org/faq/) puts it, Parquet is built for compact storage, Arrow for computation, and they are often used together.

**Hugging Face Datasets.** `load_dataset` builds an on-disk Arrow cache and memory-maps it; [the docs](https://huggingface.co/docs/datasets/about_arrow) load the full English Wikipedia with about 50 MB of RAM. With `streaming=True`, an `IterableDataset` reads as you iterate; its `shuffle` shuffles shard order and samples from a buffer, and `state_dict` resumes mid-epoch by skipping finished shards, though examples waiting in a shuffle buffer are lost ([stream docs](https://huggingface.co/docs/datasets/stream)). The Hub's dataset viewer [converts datasets to Parquet](https://huggingface.co/docs/dataset-viewer/parquet) on a `refs/convert/parquet` branch, which [DuckDB](https://duckdb.org/docs/stable/core_extensions/httpfs/hugging_face) reads through `hf://` paths.

**Training-scale formats.** [WebDataset](https://github.com/webdataset/webdataset) packs samples into numbered tar shards, where files sharing a basename form one sample, so reading is purely sequential. MosaicML’s [MDS](https://docs.mosaicml.com/projects/streaming/en/stable/preparing_datasets/dataset_format.html) shards come with an `index.json` that records each shard and its sample count, and its [Streaming library](https://docs.mosaicml.com/projects/streaming/en/stable/) keeps sample order fixed across GPU counts and resumes mid-epoch. [Lance](https://lance.org/format/) is columnar but avoids row groups, using large pages built for random access, and keeps vector, scalar and full-text indexes with the table ([distributed training](#distributed-training), [pretraining data](#pretraining-data)).

**Multimodal samples.** The [Hugging Face image dataset guide](https://huggingface.co/docs/datasets/image_dataset) shows three layouts: a metadata file whose `file_name` column points at media files, media and metadata side by side in tar shards (WebDataset), or encoded bytes in a binary column (Lance). References are easy to edit but break when files move ([vision-language models](#vision-language-models)).

**Embeddings** are derived data. Store each vector as a [fixed-size list](https://arrow.apache.org/docs/format/Columnar.html) beside the source id, a content hash and the embedding model and version. A model change can invalidate every vector: as of November 2026, Google’s [embeddings docs](https://aistudio.google.com/docs/embeddings) call the spaces of gemini-embedding-001 and gemini-embedding-2 incompatible, so upgrading means re-embedding all existing data ([unstructured pipelines](#unstructured-pipelines), [embeddings](#embeddings)).

**Inspecting.** [DuckDB](https://duckdb.org/docs/stable/data/parquet/overview) queries Parquet in place and shows the footer through [`parquet_metadata`](https://duckdb.org/docs/stable/data/parquet/metadata); it and [Polars’ lazy API](https://docs.pola.rs/user-guide/lazy/optimizations/) push projections and filters into the scan.

## In practice

Write and check JSON Lines before any upload:

```python
import json

examples = [
    {"messages": [
        {"role": "system", "content": "You are a support assistant."},
        {"role": "user", "content": "Can I change my plan mid-cycle?"},
        {"role": "assistant", "content": "Yes. The change applies from your next invoice."},
    ]},
]

with open("train.jsonl", "w", encoding="utf-8") as f:
    for ex in examples:
        f.write(json.dumps(ex, ensure_ascii=False) + "\n")  # compact: one record, one line

with open("train.jsonl", encoding="utf-8") as f:
    for n, line in enumerate(f, 1):
        roles = [m["role"] for m in json.loads(line)["messages"]]
        if roles[-1] != "assistant":
            raise ValueError(f"line {n}: last turn is {roles[-1]!r}, expected 'assistant'")
```

Read the footer before you load a Parquet dataset, then let the engine push the query down:

```python
import duckdb

# Footer only: one row per column chunk, with its statistics.
duckdb.sql("""
    SELECT row_group_id, stats_min_value, stats_max_value, total_compressed_size
    FROM parquet_metadata('logs/part-0.parquet')
    WHERE path_in_schema = 'score'
""").show()

# Reads only the lang and score chunks of row groups that can match.
duckdb.sql("""
    SELECT lang, count(*) AS n
    FROM 'logs/*.parquet'
    WHERE score >= 0.8
    GROUP BY lang
    ORDER BY n DESC
""").show()
```

Pick by use case:

| Use case | Format |
|---|---|
| Fine-tuning examples, eval cases, batch requests | JSON Lines |
| Tables you filter and aggregate | Parquet |
| Hand-offs between tools on one machine | Arrow |
| Preprocessing with Hugging Face | Datasets (Arrow cache) |
| Media training sets read in order | WebDataset or MDS shards |
| Random access, vectors beside metadata | Lance |
| Small exports for people | CSV |

## Numbers to know

> [!number]
> Documented defaults and limits, as of November 2026. Parquet row groups: 512 MB to 1 GB in the [Parquet docs](https://parquet.apache.org/docs/file-format/configurations/); 100 to 300 MB uncompressed in the [Hugging Face dataset viewer](https://huggingface.co/docs/dataset-viewer/parquet). pyarrow’s [`write_table`](https://arrow.apache.org/docs/python/generated/pyarrow.parquet.write_table.html) sizes groups in rows, not bytes: at most 1,048,576 rows by default. [`IterableDataset.shuffle`](https://huggingface.co/docs/datasets/stream) buffers 1,000 examples by default. [WebDataset](https://github.com/webdataset/webdataset) claims 3 to 10 times higher I/O rates from local drives than random access gives. [OpenAI fine-tuning](https://developers.openai.com/api/docs/guides/supervised-fine-tuning) needs at least 10 examples and is winding down: it is closed to new users, and eligible existing customers can create jobs until January 6, 2027, unless the base model shuts down earlier.

## Pitfalls and anti-patterns

> [!pitfall] Pretty-printed records in a .jsonl file
> `json.dumps(record, indent=2)` spreads one record over many lines, and line-based readers fail. Serialize compactly and parse every line before uploading.

> [!pitfall] Filters on unsorted columns
> Statistics skip a row group only if its min and max exclude the filter, and in shuffled data every group spans nearly the full range. Sort by your main filter column, such as date or source, before writing.

- **Giant row groups.** Most libraries [stream one group at a time](https://huggingface.co/docs/dataset-viewer/parquet), so memory use grows with group size.
- **Trusting batch result order.** Join on `custom_id`.
- **One-source shards behind a small shuffle buffer.** Early batches come from one source; mix sources when writing shards.

## Talk like an expert

The vocabulary: **row group**, **column chunk**, **footer**, **projection** and **predicate pushdown**, **zone maps**, **zero-copy**, **memory mapping**, **shuffle buffer**. Experts read the footer before tuning a slow query, and size row groups for the reader. Table formats over these files belong to [data lakehouses](#data-lakehouses), the jobs that write them to [pipeline orchestration](#data-pipeline-orchestration), and their history to [dataset versioning](#dataset-versioning-lineage).

The live debate: do AI workloads, with random access, blob columns and vectors, need new formats such as Lance, or better Parquet writers and indexes?

> [!hottake] For most teams, JSON Lines plus Parquet is the whole format strategy.
> **The counterargument:** multimodal training at scale breaks it. Shuffling needs random access or well-mixed shards, and blob-heavy rows fit row groups poorly, which is why WebDataset, MDS and Lance exist.

## Check yourself

```quiz
data-formats
```

## Go deeper

- [Apache Parquet file format](https://parquet.apache.org/docs/file-format/), with its metadata defined in [parquet.thrift](https://github.com/apache/parquet-format/blob/master/src/main/thrift/parquet.thrift)
- [Apache Arrow Columnar Format](https://arrow.apache.org/docs/format/Columnar.html)
- Hugging Face Datasets: [Datasets and Arrow](https://huggingface.co/docs/datasets/about_arrow) and [Stream](https://huggingface.co/docs/datasets/stream)
- [WebDataset](https://github.com/webdataset/webdataset) and [MosaicML Streaming](https://docs.mosaicml.com/projects/streaming/en/stable/)

## Related

- [Fine-tuning in practice](#fine-tuning-practice)
- [Building eval datasets](#eval-datasets)
- [Pipeline orchestration and processing engines](#data-pipeline-orchestration)
- [Data lakes, warehouses and lakehouses](#data-lakehouses)
- [Pretraining data](#pretraining-data)
- [Model APIs in practice](#model-apis)
