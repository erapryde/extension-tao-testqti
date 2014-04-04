<?php
/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2013 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

use qtism\common\storage\IStream;
use qtism\runtime\tests\AbstractAssessmentTestSessionFactory;
use qtism\common\storage\MemoryStream;
use qtism\runtime\storage\binary\AbstractQtiBinaryStorage;
use qtism\runtime\storage\common\StorageException;
use qtism\data\AssessmentTest;
use qtism\runtime\tests\AssessmentTestSession;
use qtism\runtime\storage\binary\QtiBinaryStreamAccessFsFile;

/**
 * A QtiSm AssessmentTestSession Storage Service implementation for TAO.
 * 
 * @author Jérôme Bogaerts <jerome@taotesting.com>
 *
 */
class taoQtiTest_helpers_TestSessionStorage extends AbstractQtiBinaryStorage {
   
   /**
    * The last recorded error.
    * 
    * @var integer
    */
   private $lastError = -1;
    
   /**
    * Create a new TestSessionStorage object.
    * 
    * @param AbstractAssessmentTestSessionFactory $factory The factory to be used by the storage to instantiate new AssessmentTestSession objects.
    */
   public function __construct(AbstractAssessmentTestSessionFactory $factory) {
       parent::__construct($factory);
   }
   
   /**
    * Get the last retrieved error. -1 means
    * no error.
    * 
    * @return integer
    */
   public function getLastError() {
       return $this->lastError;
   }
   
   /**
    * Set the last retrieved error. -1 means
    * no error.
    * 
    * @param integer $lastError
    */
   public function setLastError($lastError) {
       $this->lastError = $lastError;
   }
   
   public function retrieve($sessionId) {
       $this->setLastError(-1);
       
       return parent::retrieve($sessionId);
   }
   
   protected function getRetrievalStream(AssessmentTest $assessmentTest, $sessionId) {
    
       $storageService = tao_models_classes_service_StateStorage::singleton();
       $userUri = common_session_SessionManager::getSession()->getUserUri();
       
       if (is_null($userUri) === true) {
           $msg = "Could not retrieve current user URI.";
           throw new StorageException($msg, StorageException::RETRIEVAL);
       }

       $data = $storageService->get($userUri, $sessionId);
       
       $stateEmpty = (empty($data) === true);
       $stream = new MemoryStream(($stateEmpty === true) ? '' : $data);
       $stream->open();
       
       if ($stateEmpty === false) {
           // Consume additional error (short signed integer).
           $this->setLastError($stream->read(2));
       }
       
       $stream->close();
       return $stream;
   }
   
   protected function persistStream(AssessmentTestSession $assessmentTestSession, MemoryStream $stream) {
       
       $storageService = tao_models_classes_service_StateStorage::singleton();
       $userUri = common_session_SessionManager::getSession()->getUserUri();
       
       if (is_null($userUri) === true) {
           $msg = "Could not retrieve current user URI.";
           throw new StorageException($msg, StorageException::RETRIEVAL);
       }
       
       $data = $this->getLastError() . $stream->getBinary();
       $storageService->set($userUri, $assessmentTestSession->getSessionId(), $data);
   }
   
   public function exists($sessionId) {
       $storageService = tao_models_classes_service_StateStorage::singleton();
       $userUri = common_session_SessionManager::getSession()->getUserUri();
       
       if (is_null($userUri) === true) {
           $msg = "Could not retrieve current user URI.";
           throw new StorageException($msg, StorageException::RETRIEVAL);
       }
       
       return $storageService->has($userUri, $sessionId);
   }
   
   protected function createBinaryStreamAccess(IStream $stream) {
       return new QtiBinaryStreamAccessFsFile($stream);
   }
}