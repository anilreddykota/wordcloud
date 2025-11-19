import  { useEffect, useRef } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
import "./WordCloud.css";

const WordCloud = ({ words, question, width = 500, height = 300, theme = "light" }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!words.length) return;

        // ✅ Clear previous drawing
        d3.select(svgRef.current).selectAll("*").remove();

        // Professional color schemes based on theme
        const colorSchemes = {
            light: [
                "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444",
                "#06B6D4", "#8B5CF6", "#EC4899", "#6366F1", "#84CC16"
            ],
            dark: [
                "#60A5FA", "#A78BFA", "#34D399", "#FBBF24", "#F87171",
                "#22D3EE", "#C084FC", "#F472B6", "#818CF8", "#A3E635"
            ]
        };

        const colors = colorSchemes[theme];

        // Word frequency calculation for better sizing
        const wordFreq = {};
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });

        const maxFreq = Math.max(...Object.values(wordFreq));
        const minSize = 16;
        const maxSize = 72;

        const layout = cloud()
            .size([width, height])
            .words(Object.keys(wordFreq).map(word => ({ 
                text: word, 
                size: minSize + (wordFreq[word] / maxFreq) * (maxSize - minSize),
                frequency: wordFreq[word]
            })))
            .padding(8)
            .rotate(() => {
                const rotations = [0, 90, -90, 45, -45];
                return rotations[Math.floor(Math.random() * rotations.length)];
            })
            .fontSize(d => d.size)
            .font("Inter, system-ui, sans-serif")
            .fontWeight("600")
            .on("end", draw);

        layout.start();

        function draw(words) {
            const svg = d3
                .select(svgRef.current)
                .attr("width", width)
                .attr("height", height)
                .attr("class", theme === "dark" ? "word-cloud-dark" : "word-cloud-light")
                .style("background", "transparent");

            const g = svg
                .append("g")
                .attr("transform", `translate(${width / 2},${height / 2})`);

            // Add subtle background gradient
            const defs = svg.append("defs");
            
            const gradient = defs.append("radialGradient")
                .attr("id", `wordcloud-gradient-${theme}`)
                .attr("cx", "50%")
                .attr("cy", "50%")
                .attr("r", "50%");

            if (theme === "dark") {
                gradient.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", "rgba(59, 130, 246, 0.1)");
                gradient.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", "rgba(0, 0, 0, 0)");
            } else {
                gradient.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", "rgba(59, 130, 246, 0.05)");
                gradient.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", "rgba(255, 255, 255, 0)");
            }

            svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("fill", `url(#wordcloud-gradient-${theme})`);

            const texts = g
                .selectAll("text")
                .data(words)
                .enter()
                .append("text")
                .style("fill", (d, i) => colors[i % colors.length])
                .style("font-size", d => `${d.size}px`)
                .style("font-family", "Inter, system-ui, sans-serif")
                .style("font-weight", d => d.frequency > 1 ? "700" : "600")
                .style("opacity", 0.9)
                .style("cursor", "default")
                .attr("text-anchor", "middle")
                .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
                .text(d => d.text);

            // Add hover effects
            texts
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .style("opacity", 1)
                        .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.2))")
                        .transition()
                        .duration(200)
                        .style("font-size", `${d.size * 1.1}px`);
                })
                .on("mouseout", function(event, d) {
                    d3.select(this)
                        .style("opacity", 0.9)
                        .style("filter", "none")
                        .transition()
                        .duration(200)
                        .style("font-size", `${d.size}px`);
                });

            // Add entrance animation
            texts
                .style("opacity", 0)
                .transition()
                .duration(800)
                .delay((d, i) => i * 50)
                .style("opacity", 0.9);
        }
    }, [words, width, height, theme]);

    // ✅ Reset word cloud when `question` changes
    useEffect(() => {
        d3.select(svgRef.current).selectAll("*").remove();
    }, [question]);

    return (
        <div className="flex items-center justify-center w-full h-full">
            {words.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
                    }`}>
                        <svg 
                            className="w-8 h-8" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M7 8h10m0 0V18a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0L13 13l-4-4" 
                            />
                        </svg>
                    </div>
                    <p className="text-lg font-medium mb-2">Waiting for responses...</p>
                    <p className="text-sm">Words will appear here as participants submit their answers</p>
                </div>
            ) : (
                <svg ref={svgRef} className="transition-all duration-300"></svg>
            )}
        </div>
    );
};

export default WordCloud;
