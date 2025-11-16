#!/usr/bin/env node
/**
 * LM Studio CLI Tool
 *
 * Command-line interface for managing LFM2 models and agents.
 */

import { execSync } from 'child_process';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

program
  .name('lm-studio-cli')
  .description('CLI tool for LM Studio LFM2 agent management')
  .version('1.0.0');

// Bootstrap command
program
  .command('bootstrap')
  .description('Install LM Studio and dependencies')
  .action(() => {
    const spinner = ora('Installing LM Studio SDK').start();
    try {
      execSync('pip install lmstudio axolotl accelerate', { stdio: 'inherit' });
      spinner.succeed('LM Studio SDK installed successfully');
      console.log(chalk.green('\n✓ Bootstrap complete!'));
      console.log(chalk.blue('  Run: lm-studio-cli get LFM2-350M-Instruct'));
    } catch (error) {
      spinner.fail('Installation failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Get model command
program
  .command('get <model>')
  .description('Download LFM2 model from LM Studio')
  .action((model) => {
    const spinner = ora(`Downloading ${model}`).start();
    try {
      const fullName = model.includes('/')
        ? model
        : `lmstudio-community/${model}-GGUF`;
      execSync(`lms get ${fullName}`, { stdio: 'inherit' });
      spinner.succeed(`Model ${fullName} downloaded`);
    } catch (error) {
      spinner.fail('Download failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Load model command
program
  .command('load <model>')
  .description('Load LFM2 model into LM Studio')
  .action((model) => {
    const spinner = ora(`Loading ${model}`).start();
    try {
      execSync(`lms load ${model}`, { stdio: 'inherit' });
      spinner.succeed(`Model ${model} loaded`);
    } catch (error) {
      spinner.fail('Load failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Unload model command
program
  .command('unload')
  .description('Unload current model from LM Studio')
  .action(() => {
    const spinner = ora('Unloading model').start();
    try {
      execSync('lms unload', { stdio: 'inherit' });
      spinner.succeed('Model unloaded');
    } catch (error) {
      spinner.fail('Unload failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Start agent command
program
  .command('agent:start')
  .description('Start LM Studio agent connected to AI Bridge')
  .option('-m, --model <name>', 'Model name', 'lmstudio-community/LFM2-350M-Instruct-GGUF')
  .option('-b, --bridge <url>', 'AI Bridge URL', 'ws://localhost:65028')
  .action((options) => {
    console.log(chalk.blue(`Starting agent with model: ${options.model}`));
    console.log(chalk.blue(`Connecting to bridge: ${options.bridge}`));
    try {
      execSync(
        `python src/agents/lm-studio-agent.py --model ${options.model} --bridge ${options.bridge}`,
        { stdio: 'inherit' }
      );
    } catch (error) {
      console.error(chalk.red('Agent failed to start'));
      process.exit(1);
    }
  });

// Fine-tune command
program
  .command('fine-tune')
  .description('Fine-tune LFM2 model with custom dataset')
  .requiredOption('-d, --dataset <path>', 'Path to training dataset (JSONL)')
  .option('-m, --model <name>', 'Base model', 'lmstudio-community/LFM2-350M-Instruct-GGUF')
  .option('-e, --epochs <number>', 'Training epochs', '3')
  .option('-lr, --learning-rate <rate>', 'Learning rate', '2e-5')
  .option('-o, --output <dir>', 'Output directory', './fine-tuned-models')
  .action((options) => {
    const spinner = ora('Starting fine-tuning').start();
    console.log(chalk.blue(`\nDataset: ${options.dataset}`));
    console.log(chalk.blue(`Base model: ${options.model}`));
    console.log(chalk.blue(`Epochs: ${options.epochs}`));
    console.log(chalk.blue(`Learning rate: ${options.learningRate}\n`));

    try {
      const cmd = `python -c "
import sys
sys.path.insert(0, '.')
from src.agents.lm_studio_fine_tuner import LMStudioFineTuner
import json

tuner = LMStudioFineTuner('${options.model}', '${options.output}')

# Load dataset
with open('${options.dataset}') as f:
    data = [json.loads(line) for line in f]

dataset_path = tuner.prepare_dataset(data)
config_path = tuner.create_axolotl_config(
    dataset_path,
    num_epochs=${options.epochs},
    learning_rate=${options.learningRate}
)
tuner.run_fine_tuning(config_path)
"`;

      execSync(cmd, { stdio: 'inherit' });
      spinner.succeed('Fine-tuning complete!');
      console.log(chalk.green(`\n✓ Model saved to: ${options.output}`));
    } catch (error) {
      spinner.fail('Fine-tuning failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program.parse();
