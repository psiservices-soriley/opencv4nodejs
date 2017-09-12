import cv from 'dut';
import { expect } from 'chai';
import { assertPropsWithValue } from 'utils';

module.exports = () => {
  describe('SVM', () => {
    const samples = new cv.Mat([
      [100, 200, 200],
      [200, 100, 200],
      [150, 150, 150],
      [150, 150, 200],
      [100, 100, 200],
      [100, 100, 100],
      [10, 20, 20],
      [20, 10, 20],
      [15, 15, 15],
      [15, 15, 20],
      [10, 10, 20],
      [10, 10, 10]
    ], cv.cvTypes.CV_32F);
    const labels = new cv.Mat([[0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]], cv.cvTypes.CV_32S);
    const trainData = new cv.TrainData(
      samples,
      cv.cvTypes.sampleTypes.ROW_SAMPLE,
      labels
    );
    const someArgs = {
      c: 0.1,
      coef0: 1.1,
      degree: Math.PI,
      nu: 0.4,
      p: 0.5,
      kernelType: cv.cvTypes.svmKernelTypes.SIGMOID
    };

    describe('constructor', () => {
      it('should be constructable without args', () => {
        expect(new cv.SVM()).to.be.instanceOf(cv.SVM);
      });

      it('should throw if arg0 is not an obj', () => {
        expect(() => new cv.SVM(undefined)).to.throw();
      });

      it('should not throw if arg0 is an obj', () => {
        expect(() => new cv.SVM({})).not.to.throw();
      });

      it('should be constructable from args', () => {
        const svm = new cv.SVM(someArgs);
        assertPropsWithValue(svm)(someArgs);
      });

      it('should not be trained', () => {
        expect(new cv.SVM()).to.have.property('isTrained').to.be.false;
      });
    });

    describe('setParams', () => {
      it('should set params', () => {
        const svm = new cv.SVM();
        svm.setParams(someArgs);
        assertPropsWithValue(svm)(someArgs);
      });

      it('should set only specified params', () => {
        const args = {
          c: 0.2,
          coef0: 0.1
        };
        const svm = new cv.SVM(someArgs);
        svm.setParams(args);
        assertPropsWithValue(svm)({
          ...someArgs,
          ...args
        });
      });
    });


    describe('training', () => {
      describe('train', () => {
        it('should be trainable with trainData', () => {
          const svm = new cv.SVM();
          const ret = svm.train(trainData);
          expect(ret).to.be.a('boolean');
          expect(svm).to.have.property('isTrained').to.be.true;
          expect(svm).to.have.property('varCount').to.equal(samples.cols);
        });

        it('should be trainable with trainData and flag', () => {
          const svm = new cv.SVM();
          const ret = svm.train(
            trainData,
            cv.cvTypes.statModelFlags.RAW_OUTPUT
          );
          expect(ret).to.be.a('boolean');
          expect(svm).to.have.property('isTrained').to.be.true;
          expect(svm).to.have.property('varCount').to.equal(samples.cols);
        });

        it('should be trainable with samples, layout and responses', () => {
          const svm = new cv.SVM();
          const ret = svm.train(
            samples,
            cv.cvTypes.sampleTypes.ROW_SAMPLE,
            labels
          );
          expect(ret).to.be.a('boolean');
          expect(svm).to.have.property('isTrained').to.be.true;
          expect(svm).to.have.property('varCount').to.equal(samples.cols);
        });
      });

      describe('trainAuto', () => {
        const kFold = 20;
        const cGrid = new cv.ParamGrid(cv.cvTypes.svmParamTypes.C);
        const gammaGrid = new cv.ParamGrid(cv.cvTypes.svmParamTypes.GAMMA);
        const pGrid = new cv.ParamGrid(cv.cvTypes.svmParamTypes.P);
        const nuGrid = new cv.ParamGrid(cv.cvTypes.svmParamTypes.NU);
        const coeffGrid = new cv.ParamGrid(cv.cvTypes.svmParamTypes.COEF);
        const degreeGrid = new cv.ParamGrid(cv.cvTypes.svmParamTypes.DEGREE);
        const balanced = true;

        it('should be trainable with trainData', () => {
          const svm = new cv.SVM();
          const ret = svm.trainAuto(trainData);
          expect(ret).to.be.a('boolean');
          expect(svm).to.have.property('isTrained').to.be.true;
          expect(svm).to.have.property('varCount').to.equal(samples.cols);
        });

        it('should be trainable with trainData and all optional args', () => {
          const svm = new cv.SVM();
          const ret = svm.trainAuto(
            trainData,
            kFold,
            cGrid,
            gammaGrid,
            pGrid,
            nuGrid,
            coeffGrid,
            degreeGrid,
            balanced
          );
          expect(ret).to.be.a('boolean');
          expect(svm).to.have.property('isTrained').to.be.true;
          expect(svm).to.have.property('varCount').to.equal(samples.cols);
        });

        it('should be trainable with trainData and first optional args', () => {
          const svm = new cv.SVM();
          const ret = svm.trainAuto(
            trainData,
            kFold
          );
          expect(ret).to.be.a('boolean');
          expect(svm).to.have.property('isTrained').to.be.true;
          expect(svm).to.have.property('varCount').to.equal(samples.cols);
        });

        it('should be trainable with trainData and optional args object', () => {
          const svm = new cv.SVM();
          const opts = {
            kFold,
            cGrid,
            gammaGrid,
            pGrid,
            nuGrid,
            coeffGrid,
            degreeGrid,
            balanced
          };
          const ret = svm.trainAuto(trainData, opts);
          expect(ret).to.be.a('boolean');
          expect(svm).to.have.property('isTrained').to.be.true;
          expect(svm).to.have.property('varCount').to.equal(samples.cols);
        });

        it('should be trainable with trainData and some optional args', () => {
          const svm = new cv.SVM();
          const opts = {
            degreeGrid,
            balanced
          };
          const ret = svm.trainAuto(trainData, opts);
          expect(ret).to.be.a('boolean');
          expect(svm).to.have.property('isTrained').to.be.true;
          expect(svm).to.have.property('varCount').to.equal(samples.cols);
        });
      });
    });

    describe('trained model tests', () => {
      let svm;
      const predictSample = [10, 10.5, 10.5];
      const predictSamplesMat = new cv.Mat([[10, 20, 15], [100, 200, 200]], cv.cvTypes.CV_32F);

      before(() => {
        svm = new cv.SVM();
        svm.trainAuto(trainData);
      });

      describe('predict', () => {
        it('should be callable with sample array', () => {
          expect(() => svm.predict(predictSample)).to.not.throw();
        });

        it('should be callable with samples mat', () => {
          expect(() => svm.predict(predictSamplesMat)).to.not.throw();
        });

        it('should return classification result of predicted sample', () => {
          expect(svm.predict(predictSample)).to.equal(1);
        });

        it('should return classification results of predicted samples', () => {
          const predictions = svm.predict(predictSamplesMat);
          expect(predictions).to.be.an('array').lengthOf(2);
          expect(predictions).to.have.ordered.members([1, 0]);
        });
      });

      describe('getSupportVectors', () => {
        it('should return support vectors', () => {
          expect(svm.getSupportVectors()).to.be.instanceOf(cv.Mat);
        });
      });

      describe('getUncompressedSupportVectors', () => {
        (cv.version.minor < 2 ? it.skip : it)('should return support vectors', () => {
          expect(svm.getUncompressedSupportVectors()).to.be.instanceOf(cv.Mat);
        });
      });

      describe('calcError', () => {
        it.skip('calcError', () => {});
      });
    });
  });
};