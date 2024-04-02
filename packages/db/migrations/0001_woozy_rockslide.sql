DROP TABLE `testTable`;
--> statement-breakpoint

create virtual table vss_summaries using vss0(
  summary_embedding(384),
);