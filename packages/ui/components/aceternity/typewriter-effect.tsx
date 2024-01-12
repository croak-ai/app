"use client";

import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Word = {
  text: string;
  className?: string;
};

type Phrase = {
  words: Word[];
  duration: number;
  className?: string;
};

type TypewriterEffectSmoothProps = {
  phrases: Phrase[];
  className?: string;
  cursorClassName?: string;
};

export const TypewriterEffectSmooth = ({
  phrases,
  className,
}: TypewriterEffectSmoothProps) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  // split text inside of words into array of characters
  const phrasesArray = phrases.map((phrase) => {
    return {
      ...phrase,
      words: phrase.words.map((word) => {
        return {
          ...word,
          text: word.text.split(""),
        };
      }),
    };
  });
  const renderWords = () => {
    return (
      <div>
        {phrasesArray[currentPhraseIndex]?.words.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <span key={`char-${index}`} className={cn(word.className)}>
                  {char}
                </span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </div>
    );
  };
  useEffect(() => {
    const interval = setInterval(() => {
      const newIndex = currentPhraseIndex + 1;

      if (newIndex >= phrases.length) {
        return;
      }

      setCurrentPhraseIndex(newIndex);
    }, (phrasesArray[currentPhraseIndex]?.duration || 0) * 1000 + 750);

    return () => clearInterval(interval);
  }, [currentPhraseIndex]);

  return (
    <div className={cn("lex space-x-1", className)}>
      <motion.div
        key={currentPhraseIndex} // Add this line
        className="overflow-hidden "
        initial={{
          width: "0%",
        }}
        animate={{
          width: "fit-content",
        }}
        transition={{
          duration: phrasesArray[currentPhraseIndex]?.duration || 0,
          ease: "linear",
          delay: 0.1,
        }}
      >
        <div
          className={phrases[currentPhraseIndex]?.className}
          style={{
            whiteSpace: "nowrap",
          }}
        >
          {renderWords()}
        </div>
      </motion.div>
    </div>
  );
};
