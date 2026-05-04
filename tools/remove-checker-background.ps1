Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class CheckerRemover
{
    public static string Run(string source, string backup)
    {
        if (!File.Exists(source)) throw new FileNotFoundException(source);
        if (!File.Exists(backup)) File.Copy(source, backup);

        using (var original = new Bitmap(backup))
        using (var bmp = new Bitmap(original.Width, original.Height, PixelFormat.Format32bppArgb))
        using (var graphics = Graphics.FromImage(bmp))
        {
            graphics.DrawImage(original, 0, 0, original.Width, original.Height);

            int w = bmp.Width;
            int h = bmp.Height;
            var rect = new Rectangle(0, 0, w, h);
            var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            int stride = data.Stride;
            int bytes = Math.Abs(stride) * h;
            byte[] pixels = new byte[bytes];
            Marshal.Copy(data.Scan0, pixels, 0, bytes);

            bool[] visited = new bool[w * h];
            bool[] remove = new bool[w * h];
            int[] queue = new int[w * h];
            int head = 0;
            int tail = 0;

            Action<int, int> enqueue = null;
            enqueue = (x, y) =>
            {
                if (x < 0 || x >= w || y < 0 || y >= h) return;
                int idx = y * w + x;
                if (visited[idx]) return;
                visited[idx] = true;
                if (!IsBackground(pixels, stride, x, y)) return;
                remove[idx] = true;
                queue[tail++] = idx;
            };

            for (int x = 0; x < w; x++)
            {
                enqueue(x, 0);
                enqueue(x, h - 1);
            }
            for (int y = 0; y < h; y++)
            {
                enqueue(0, y);
                enqueue(w - 1, y);
            }

            while (head < tail)
            {
                int idx = queue[head++];
                int x = idx % w;
                int y = idx / w;
                enqueue(x + 1, y);
                enqueue(x - 1, y);
                enqueue(x, y + 1);
                enqueue(x, y - 1);
            }

            int removed = 0;
            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    int idx = y * w + x;
                    if (!remove[idx]) continue;
                    int offset = y * stride + x * 4;
                    pixels[offset] = 0;
                    pixels[offset + 1] = 0;
                    pixels[offset + 2] = 0;
                    pixels[offset + 3] = 0;
                    removed++;
                }
            }

            Marshal.Copy(pixels, 0, data.Scan0, bytes);
            bmp.UnlockBits(data);
            bmp.Save(source, ImageFormat.Png);
            return "size=" + w + "x" + h + " transparent_pixels=" + removed;
        }
    }

    private static bool IsBackground(byte[] pixels, int stride, int x, int y)
    {
        int offset = y * stride + x * 4;
        int b = pixels[offset];
        int g = pixels[offset + 1];
        int r = pixels[offset + 2];
        int max = Math.Max(r, Math.Max(g, b));
        int min = Math.Min(r, Math.Min(g, b));
        double sat = max == 0 ? 0 : (max - min) / (double)max;
        double brightness = max / 255.0;
        return sat < 0.20 && brightness > 0.10 && brightness < 0.88;
    }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$source = (Resolve-Path (Join-Path $PSScriptRoot '..\assets\ai-robot.png')).Path
$backup = Join-Path (Split-Path $source) 'ai-robot-original.png'
$result = [CheckerRemover]::Run($source, $backup)
Write-Output "source=$source"
Write-Output "backup=$backup"
Write-Output $result
