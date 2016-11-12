import sys
import time

_loading_bar_default_width = 50
_loading_bar_width = 0
_loading_bar_start_time = 0
_loading_bar_count = 0
_loading_bar_total = 0
_loading_bar_reset_str = '\x1b[A\x1b[2K\x1b[G'
_loading_bar_fmt_str = ''

def loading_bar_init(total, width=_loading_bar_default_width):
    """
    Initializes the loading bar.
    Arguments:
        total: The total amount of items that will be processed
        width: The width of the loading bar
    """
    global _loading_bar_width, _loading_bar_start_time, _loading_bar_count, _loading_bar_total, _loading_bar_fmt_str
    _loading_bar_width = width
    _loading_bar_start_time = time.time()
    _loading_bar_count = 0
    _loading_bar_total = total
    _loading_bar_fmt_str = '[{: <'+str(_loading_bar_width)+'s}] {:7.2%} {:'+str(len(str(_loading_bar_total)))+'d}/{:d}  Elapsed: {:s} Remaining: {:s}\n'
    sys.stdout.write('[' + ' ' * width + ']\n')
    sys.stdout.flush()

def _format_time(time):
    return '{:d}:{:02d}:{:02d}'.format(int(time / 60.0 / 60.0), int(time / 60.0 % 60.0), int(time % 60.0))

def loading_bar_update():
    """
    Updates the loading bar.
    """
    global _loading_bar_count
    _loading_bar_count += 1
    sys.stdout.write(_loading_bar_reset_str)
    progress = float(_loading_bar_count) / _loading_bar_total
    bars = int(_loading_bar_width * progress)
    curr_time = time.time()
    time_elapsed = curr_time - _loading_bar_start_time
    time_remaining = time_elapsed / progress - time_elapsed
    sys.stdout.write(_loading_bar_fmt_str.format('=' * bars, progress, _loading_bar_count, _loading_bar_total, _format_time(time_elapsed), _format_time(time_remaining)))
    sys.stdout.flush()

def loading_bar_finish():
    """
    Cleans up the loading bar.
    """
    sys.stdout.write(_loading_bar_reset_str)
    curr_time = time.time()
    time_elapsed = curr_time - _loading_bar_start_time
    sys.stdout.write(_loading_bar_fmt_str.format('=' * _loading_bar_width, 1.0, _loading_bar_total, _loading_bar_total, _format_time(time_elapsed), _format_time(0)) + '\a')
    sys.stdout.flush()
