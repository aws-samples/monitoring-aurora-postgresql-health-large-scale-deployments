import { DateRangePickerProps } from "@cloudscape-design/components";
import { ReactNode } from 'react';

export const DEFAULT_DATE_FILTER: DateRangePickerProps.RelativeValue = {
  key: "previous-90-days",
  type: "relative",
  amount: 90,
  unit: "day"
}

export const APP_NAME = "Aurora Postgres Health Monitor";

type HelpTextType = {
  [key: string]: string | ReactNode
};

export const HELPTEXT: HelpTextType = {
  "CPUUtilization": <div>
    <h1>An Instance is Reported with High CPU utilization</h1>

    <h2>Symptom</h2>
    <p>CloudWatch metric CPUUtilization reports CPU utilization above the threshold defined.</p>

    <h2>Possible Causes</h2>
    <ol>
      <li>Compare the following metrics with CPUUtilization (for the peak times) to identify the possible causes behind the issue:
        <ul>
          <li>WriteIOPS</li>
          <li>ReadIOPS</li>
          <li>ReadThroughput</li>
          <li>WriteThroughput</li>
        </ul>
        Increase in the IOPS and throughput may indicate sudden increase in database activity that may be caused by increased application load.
      </li>
      <li>A high CPU consuming OS process can also cause this issue. Top CPU consuming processes can be viewed from OS process list (available from the console in the database Monitoring screen on the console).</li>
      <li>A SQL that is using lot of resources (CPU/memory/IOPS) can also cause this issue. The top SQLs should be verified in the Performance Insights Top SQL screen.</li>
      <li>A high number of idle connections can also take up CPU resources.</li>
    </ol>

    <h2>Recommendations</h2>
    <ol>
      <li>Tune the SQLs causing heavy activity in the system. Sometimes a simple index can reduce the overall IO activity and hence the CPU utilization.</li>
      <li>Monitor idle connections. Implement client-side and server-side connection pooling (Amazon RDS Proxy) tools.</li>
      <li>Upgrade the server to a larger instance to gain more CPUs.</li>
    </ol>
  </div>,
  "FreeableMemory": <div>
    <h1>An Instance is Reported with Low Memory</h1>

    <h2>Symptom</h2>
    <p>CloudWatch metric FreeableMemory stays low for the period of observation.</p>

    <h2>Possible Causes</h2>
    <ol>
      <li>Memory parameters are configured too high. Check non-default settings on these parameters:
        <ul>
          <li>shared_buffers</li>
          <li>work_mem</li>
          <li>maintenance_work_mem</li>
          <li>autovacuum_work_mem</li>
          <li>logical_decoding_work_mem</li>
        </ul>
      </li>
      <li>Too many idle connections. FreeableMemory stays flat at a low level consistently with low database load.</li>
      <li>Large memory-consuming processes. FreeableMemory fluctuates with database workload changes. Investigate top OS processes/queries at specific time frames when FreeableMemory sharply declined.</li>
    </ol>

    <h2>Recommendations</h2>
    <ol>
      <li>Set shared_buffers at no more than 75% of the server memory; Set the other OS process memory parameters small to start with. Adjust them bit by bit to observe the server response.</li>
      <li>Monitor idle connections. Implement client-side and server-side connection pooling (Amazon RDS Proxy) tools.</li>
      <li>Identify the top memory-consuming processes and tune them.</li>
      <li>Upgrade the server to a larger instance to gain more memory.</li>
    </ol>
  </div>,
  "BufferCacheHitRatio": <div>
    <h1>An Instance is reported with Low Buffer Cache Hit Ratio</h1>

    <h2>Symptom</h2>
    <p>CloudWatch metric BufferCachehitRatio stays lower than the threshold defined during the period of observation.</p>

    <h2>Possible Causes</h2>
    <ol>
      <li>High amount of IOs matching the low value of this metric. Check the following values for the instance and the database parameters:
        <ul>
          <li>FreeableMemory metric</li>
          <li>CPUUtilisation metric</li>
          <li>shared_buffers – insufficient database parameter</li>
        </ul>
      </li>
      <li>Top SQLs by waits in the Performance Insights. Check a process/SQL that is using lot of memory resources or doing a lot of IO operation.</li>
      <li>Large memory-consuming processes. FreeableMemory fluctuates with database workload changes. Investigate top OS processes/queries at specific time frames when FreeableMemory sharply declined.</li>
    </ol>

    <h2>Recommendations</h2>
    <ol>
      <li>Upgrade the server to a larger instance to gain more memory</li>
      <li>Tune top SQLs with large disk IOs.</li>
      <li>Increase the value of shared_buffers parameter to assign more memory to the database instance for caching data.</li>
    </ol>
  </div>
}