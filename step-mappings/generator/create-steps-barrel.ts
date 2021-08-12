/* eslint-disable indent */
import { ensureDirectoryStructureExists } from '../../tools/fs/ensure-directory-structure-exists';
import { getFileName } from '../../tools/fs/get-filename';
import { getFilePathWithoutExtension } from '../../tools/fs/get-filepath-without-extension';
import { getFuncNameFrom } from '../../tools/fs/get-func-name-from-file-name';
import { getRelativePathOf } from '../../tools/fs/get-relative-path-from';
import { slash } from '../../tools/fs/slash';
import { config } from '../config';
import { EOL } from 'os';
import { PathLike, writeFileSync } from 'fs';

let exportIndex = -1;
function nextIndex(): number {
  exportIndex += 1;
  return exportIndex;
}
export const createStepsBarrel = (
  barrelFilePath: PathLike
): { from: (stepFiles: string[]) => void } => {
  ensureDirectoryStructureExists(barrelFilePath.toString());
  writeFileSync(barrelFilePath, 'searching steps ...');
  return {
    from: (stepFiles: string[]): void => {
      const lines: string[] = [];
      lines.push(
        `// this file was auto-generated by '${getRelativePathOf(__filename).from(
          config.stepsBarrelFile
        )}'`
      );
      stepFiles.forEach((filePath: string): void => {
        const fileName = getFileName(filePath) || `defaultStep${nextIndex()}`;
        const relativePath = getRelativePathOf(filePath).from(barrelFilePath.toString());

        const defaultExportName = getFuncNameFrom(fileName);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const module = require(filePath);

        module.default
          ? lines.push(
              `export { default as ${defaultExportName} } from ${config.quoteMark}${slash(
                getFilePathWithoutExtension(relativePath)
              )}${config.quoteMark};`
            )
          : lines.push(
              `export * from ${config.quoteMark}${slash(
                getFilePathWithoutExtension(relativePath)
              )}${config.quoteMark};`
            );
      });
      lines.push('');

      writeFileSync(barrelFilePath, lines.join(EOL));
    },
  };
};