using System.IO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TextAppender
{
    class Program
    { 
        static void Main(string[] args)
        {
            string writePath = @"C:\PWS\pws-arnon\nf_prize_dataset\training_set_formatted\movieRatingsAll.txt";
            string readFolderPath = @"C:\PWS\pws-arnon\nf_prize_dataset\test";

            string[] files = Directory.GetFiles(readFolderPath);

            string[] endFile = { };

            for (int loop = 0; loop < files.Length; loop++)
            {
                string readPath = files[loop];
                string[] lines = File.ReadAllLines(readPath);
                string firstLine = lines[0];
                string movieIDstart = firstLine.Substring(0, firstLine.Length - 1) + ",";

                //Add movieID to every line
                for (int i = 0; i < lines.Length; i++)
                {
                    lines[i] = movieIDstart + lines[i];
                }

                lines[0] = "";

                int length = lines.Length;

                //Move every line up by 1
                for (int i = 0; i < length; i++)
                {
                    if (i != lines.Length - 1)
                    {
                        lines[i] = lines[i + 1];
                    }
                }

                //Append array to end file
                var tempArray = new string[endFile.Length + lines.Length];
                endFile.CopyTo(tempArray, 0);
                lines.CopyTo(tempArray, endFile.Length);

                endFile = tempArray;

                //Print progress
                //if (loop % 100 == 0) {
                    Console.WriteLine(loop + " / " + files.Length);
                //}
            }

            //Write to file
            File.WriteAllLines(writePath, endFile);

        }
    }
}
