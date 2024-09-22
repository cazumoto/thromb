#!/usr/bin/env python3

import numpy as np
import pandas as pd
from contextlib import ExitStack
from IPython.core.display import display

from sklearn.datasets import load_wine


wine_ds = load_wine()
wine_df = pd.DataFrame(
    data=np.c_[wine_ds["data"], wine_ds["target"]],
    columns=wine_ds["feature_names"] + ["target"],
)


def fix_column_names(df0, lowercase=False):
    df0.columns = df0.columns.str.strip()
    df0.columns = df0.columns.map(lambda x: x.replace(" ", "_"))
    df0.columns = df0.columns.map(lambda x: x.replace("-", "_"))
    df0.columns = df0.columns.map(lambda x: x.replace(".", "_"))
    if lowercase:
        df0.columns = df0.columns.map(str.lower)

    return df0


def _context_pandas(
    max_columns=222,
    max_colwidth=44,
    width=2222,
    max_rows=44,
    min_rows=33,
):
    """Apply custom context to dataframe representation (ExitStack)."""
    return [
        pd.option_context("display.max_columns", max_columns),
        pd.option_context("display.max_colwidth", max_colwidth),
        pd.option_context("display.width", width),
        pd.option_context("display.max_rows", max_rows),
        pd.option_context("display.min_rows", min_rows),
    ]


def disp_df(df0, **opt):
    """Display DF using custom formatting context.

    Examples
    --------
    >>> import numpy as np
    >>> import pandas as pd
    >>> from mvn import disp_df
    >>> from mvn.aux_pandas import wine_df
    >>> disp_df(df0)

    """
    with ExitStack() as stack:
        _ = [stack.enter_context(cont) for cont in _context_pandas(**opt)]
        display(df0)


def repr_df(df0, **opt):
    """Get DF repr using custom formatting context.

    Examples
    --------
    >>> import numpy as np
    >>> import pandas as pd
    >>> from mvn import disp_df
    >>> from mvn.aux_pandas import wine_df
    >>> print(repr_df(df0))

    """
    with ExitStack() as stack:
        _ = [stack.enter_context(cont) for cont in _context_pandas(**opt)]
        return str(df0)


def split_dataframe(dframe, max_rows):
    """Split pandas dataframe into chunks with max_rows.

    Examples
    --------
    >>> import pathlib.Path
    >>> from mvn.aux_pandas import split_dataframe
    >>> df0 = pd.DataFrame({'A': range(1, 21), 'B': range(21, 41)})
    >>> max_rows = 5e0 # 25e4
    >>> chunks_dict = split_dataframe(df0, max_rows)
    >>>
    >>> dir0 = "../../data/i0000-data-chunks/"
    >>> dir0 = pathlib.Path(dir0)
    >>> dir0.mkdir(mode=0o700, parents=True, exist_ok=True)
    >>>
    >>> for key, chunk in chunks_dict.items():
    >>>     print(f"{key}: {chunk.shape}")
    >>>     # print(chunk)
    >>>     chunk.to_pickle((dir0/key).with_suffix(".pkl"))
    >>>     print("")

    """
    max_rows = int(max_rows)
    chunks = len(dframe) // max_rows + (1 if len(dframe) % max_rows else 0)
    return {
        f"chunk_{i+1:04d}": dframe[i * max_rows : (i + 1) * max_rows]  # noqa: E203
        for i in range(chunks)
    }
