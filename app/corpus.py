"""A tiny original corpus of biology-flavored text for the teaching model.

Every sentence here was written for this bootcamp, so there are no licensing
questions about shipping it. The corpus is deliberately small (a few KB): part
of the lesson is that even a model trained on this little text starts to
produce biology-shaped words, which makes the jump to "imagine a trillion
tokens" feel concrete.
"""

CORPUS = """
The cell is the basic unit of life. Every cell carries a genome, and the genome
encodes the proteins that do the work of the cell. DNA is transcribed into RNA,
and RNA is translated into protein. The central dogma of molecular biology
describes this flow of information from DNA to RNA to protein. Gene expression
is the process by which the information in a gene is used to make a functional
product. Ribosomes read messenger RNA and assemble amino acids into proteins.
Proteins fold into three dimensional structures that determine their function.
A mutation in a gene can change the protein it encodes and change the behavior
of the cell. Cells communicate through signaling pathways that relay messages
from the membrane to the nucleus. When a signaling pathway is activated, genes
are switched on or off, and the cell responds to its environment.

RNA sequencing measures the abundance of messenger RNA in a sample of cells.
Bulk RNA sequencing averages gene expression over all the cells in a tissue.
Single cell RNA sequencing measures expression in each individual cell, so it
can reveal the different cell types hidden in a tissue. Spatial transcriptomics
keeps the location of each cell, so researchers can see how cells are organized
in the tissue. Differential expression analysis compares gene expression between
conditions, such as treated and untreated samples. The result is often displayed
as a volcano plot, with the log fold change on one axis and the significance on
the other. Principal component analysis summarizes the variation in a dataset
and can reveal batch effects between samples. Batch effects arise from technical
differences between processing groups and can mask the biology we want to find.
Normalization adjusts the counts so that samples can be compared fairly.

The polymerase chain reaction amplifies a specific segment of DNA, making
millions of copies from a tiny starting amount. Gel electrophoresis separates
DNA fragments by size, letting researchers check the result of a reaction.
Antibodies bind to specific proteins, which makes them useful tools for
detecting targets in a western blot or an immunoassay. Flow cytometry passes
cells through a laser one at a time and measures the light they scatter and the
fluorescence they emit. Microscopy reveals the structure of cells and tissues.
Model organisms such as mice, flies, and yeast let researchers study genes in a
living system. A knockout mouse lacks a functional copy of a gene, which helps
researchers learn what the gene does. CRISPR uses a guide RNA to bring an enzyme
to a precise location in the genome, where it makes a cut that researchers can
use to edit the sequence.

Statistics helps researchers decide whether a result is likely to be real or
likely to be noise. The p value measures how surprising the data would be if
there were truly no effect. The false discovery rate controls the proportion of
false positives among the results we call significant. Replication means seeing
the same result again in a new sample, and it remains the strongest evidence a
finding can have. A good experiment changes one thing at a time and keeps every
other condition constant. Controls exist because nature is full of surprises
that a careful researcher wants to catch before they become conclusions.
Curiosity drives science, and careful measurement turns curiosity into
knowledge. The literature grows every day, and each paper adds a few more
observations to what we know about cells, genes, and the molecules that carry
the messages of life.
""".strip()
